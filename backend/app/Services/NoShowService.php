<?php

namespace App\Services;

use App\Models\BlotterRecord;
use App\Models\Resident;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NoShowService
{
    /**
     * Penalty levels and their corresponding actions
     */
    const PENALTY_LEVELS = [
        1 => ['status' => 'warning', 'duration' => null, 'restrictions' => []],
        2 => ['status' => 'restricted', 'duration' => 7, 'restrictions' => ['can_submit_complaints' => false]],
        3 => ['status' => 'suspended', 'duration' => 30, 'restrictions' => ['can_submit_complaints' => false, 'can_submit_applications' => false]],
        4 => ['status' => 'permanently_restricted', 'duration' => null, 'restrictions' => ['can_submit_complaints' => false, 'can_submit_applications' => false]],
    ];

    /**
     * Mark a complainant as no-show
     */
    public function markComplainantNoShow(BlotterRecord $record, string $reason = null): void
    {
        $record->update([
            'complainant_no_show' => true,
            'complainant_no_show_at' => now(),
            'complainant_no_show_reason' => $reason,
        ]);

        $this->applyPenalty($record->resident, 'complainant');
        $this->sendNoShowNotification($record, 'complainant');
        
        Log::info('Complainant marked as no-show', [
            'case_number' => $record->case_number,
            'resident_id' => $record->resident_id,
            'reason' => $reason
        ]);
    }

    /**
     * Mark a respondent as no-show
     */
    public function markRespondentNoShow(BlotterRecord $record, string $reason = null): void
    {
        $record->update([
            'respondent_no_show' => true,
            'respondent_no_show_at' => now(),
            'respondent_no_show_reason' => $reason,
        ]);

        // Note: We don't apply penalties to respondents as they're not residents
        $this->sendNoShowNotification($record, 'respondent');
        
        Log::info('Respondent marked as no-show', [
            'case_number' => $record->case_number,
            'respondent_name' => $record->respondent_name,
            'reason' => $reason
        ]);
    }

    /**
     * Apply penalty to resident based on no-show count
     */
    protected function applyPenalty(Resident $resident, string $type): void
    {
        $resident->increment('no_show_count');
        $resident->update(['last_no_show_at' => now()]);

        $noShowCount = $resident->no_show_count;
        
        if (isset(self::PENALTY_LEVELS[$noShowCount])) {
            $penalty = self::PENALTY_LEVELS[$noShowCount];
            
            $updateData = [
                'account_status' => $penalty['status'],
                'penalty_started_at' => now(),
                'penalty_reason' => "No-show #{$noShowCount} for {$type}",
            ];

            // Apply restrictions
            foreach ($penalty['restrictions'] as $key => $value) {
                $updateData[$key] = $value;
            }

            // Set penalty end date if applicable
            if ($penalty['duration']) {
                $updateData['penalty_ends_at'] = now()->addDays($penalty['duration']);
            }

            $resident->update($updateData);

            Log::info('Penalty applied to resident', [
                'resident_id' => $resident->id,
                'no_show_count' => $noShowCount,
                'penalty_level' => $penalty['status'],
                'type' => $type
            ]);
        }
    }

    /**
     * Send no-show notification
     */
    protected function sendNoShowNotification(BlotterRecord $record, string $type): void
    {
        try {
            $subject = "No-Show Notice - Case {$record->case_number}";
            $message = "This is to inform you that you were marked as a no-show for your scheduled appointment on {$record->appointment_date} at {$record->appointment_time}.";
            
            if ($type === 'complainant' && $record->resident && $record->resident->email) {
                Mail::raw($message, function ($mail) use ($record, $subject) {
                    $mail->to($record->resident->email)
                         ->subject($subject);
                });
            }
        } catch (\Exception $e) {
            Log::error('Failed to send no-show notification', [
                'case_number' => $record->case_number,
                'type' => $type,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Submit an appeal for no-show
     */
    public function submitAppeal(BlotterRecord $record, string $type, string $reason): void
    {
        $fieldPrefix = $type === 'complainant' ? 'complainant' : 'respondent';
        
        $record->update([
            "{$fieldPrefix}_appeal_submitted" => true,
            "{$fieldPrefix}_appeal_reason" => $reason,
            "{$fieldPrefix}_appeal_status" => 'pending',
        ]);

        Log::info('Appeal submitted', [
            'case_number' => $record->case_number,
            'type' => $type,
            'reason' => $reason
        ]);
    }

    /**
     * Review and approve/reject an appeal
     */
    public function reviewAppeal(BlotterRecord $record, string $type, string $status, string $adminNotes = null): void
    {
        $fieldPrefix = $type === 'complainant' ? 'complainant' : 'respondent';
        
        $record->update([
            "{$fieldPrefix}_appeal_status" => $status,
            "{$fieldPrefix}_appeal_reviewed_at" => now(),
        ]);

        // If appeal is approved, reverse the penalty
        if ($status === 'approved' && $type === 'complainant' && $record->resident) {
            $this->reversePenalty($record->resident);
        }

        Log::info('Appeal reviewed', [
            'case_number' => $record->case_number,
            'type' => $type,
            'status' => $status,
            'admin_notes' => $adminNotes
        ]);
    }

    /**
     * Reverse penalty for resident
     */
    protected function reversePenalty(Resident $resident): void
    {
        $resident->update([
            'account_status' => 'active',
            'penalty_started_at' => null,
            'penalty_ends_at' => null,
            'penalty_reason' => null,
            'can_submit_complaints' => true,
            'can_submit_applications' => true,
        ]);

        Log::info('Penalty reversed for resident', [
            'resident_id' => $resident->id
        ]);
    }

    /**
     * Check if resident can submit complaints
     */
    public function canSubmitComplaints(Resident $resident): bool
    {
        // Check if penalty has expired
        if ($resident->penalty_ends_at && now()->isAfter($resident->penalty_ends_at)) {
            $this->reversePenalty($resident);
            return true;
        }

        return $resident->can_submit_complaints && $resident->account_status === 'active';
    }

    /**
     * Get penalty information for resident
     */
    public function getPenaltyInfo(Resident $resident): array
    {
        return [
            'account_status' => $resident->account_status,
            'no_show_count' => $resident->no_show_count,
            'last_no_show_at' => $resident->last_no_show_at,
            'penalty_started_at' => $resident->penalty_started_at,
            'penalty_ends_at' => $resident->penalty_ends_at,
            'penalty_reason' => $resident->penalty_reason,
            'can_submit_complaints' => $resident->can_submit_complaints,
            'can_submit_applications' => $resident->can_submit_applications,
        ];
    }
}
