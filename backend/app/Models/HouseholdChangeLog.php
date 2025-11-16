<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseholdChangeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'household_id',
        'change_type',
        'description',
        'old_value',
        'new_value',
        'change_date',
        'reported_by',
        'status',
        'reviewed_by_user_id',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'change_date' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    protected $appends = ['change_type_label', 'status_label'];

    /**
     * Relationship with Household
     */
    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Relationship with User who reviewed the change
     */
    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    /**
     * Get change type label
     */
    public function getChangeTypeLabelAttribute()
    {
        $labels = [
            'relocation' => 'Member Relocation',
            'deceased' => 'Deceased Member',
            'new_member' => 'New Household Member',
            'address_change' => 'Address Change',
            'contact_update' => 'Contact Update',
            'household_size' => 'Household Size Change',
            'income_change' => 'Income Change',
            'benefit_eligibility' => 'Benefit Eligibility Change',
        ];

        return $labels[$this->change_type] ?? ucfirst(str_replace('_', ' ', $this->change_type));
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        $labels = [
            'pending_review' => 'Pending Review',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'implemented' => 'Implemented',
        ];

        return $labels[$this->status] ?? ucfirst(str_replace('_', ' ', $this->status));
    }

    /**
     * Scope to get pending changes
     */
    public function scopePendingReview($query)
    {
        return $query->where('status', 'pending_review');
    }

    /**
     * Scope to get approved changes
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope to get rejected changes
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for specific household
     */
    public function scopeForHousehold($query, $householdId)
    {
        return $query->where('household_id', $householdId);
    }

    /**
     * Scope for specific change type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('change_type', $type);
    }

    /**
     * Approve the change
     */
    public function approve($userId, $notes = null)
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by_user_id' => $userId,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);

        // Trigger household record update
        $this->applyChangeToHousehold();

        return $this;
    }

    /**
     * Reject the change
     */
    public function reject($userId, $notes = null)
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_by_user_id' => $userId,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);

        return $this;
    }

    /**
     * Apply approved change to household record
     */
    protected function applyChangeToHousehold()
    {
        if ($this->status !== 'approved') {
            return;
        }

        $household = $this->household;
        if (!$household) {
            return;
        }

        try {
            switch ($this->change_type) {
                case 'address_change':
                    $household->update(['address' => $this->new_value]);
                    break;

                case 'contact_update':
                    $contactData = json_decode($this->new_value, true);
                    $household->update([
                        'mobilenumber' => $contactData['phone'] ?? $household->mobilenumber,
                        'email' => $contactData['email'] ?? $household->email,
                    ]);
                    break;

                case 'household_size':
                    $household->update(['members_count' => $this->new_value]);
                    break;

                case 'deceased':
                    // Decrease household size if member was counted
                    if ($household->members_count > 0) {
                        $household->decrement('members_count');
                    }
                    break;

                case 'new_member':
                    // Increase household size
                    $household->increment('members_count');
                    break;

                case 'relocation':
                    // Decrease household size if member relocated out
                    if ($household->members_count > 0) {
                        $household->decrement('members_count');
                    }
                    break;
            }

            // Mark as implemented
            $this->update(['status' => 'implemented']);
        } catch (\Exception $e) {
            \Log::error('Failed to apply change to household: ' . $e->getMessage());
        }
    }

    /**
     * Get statistics for change logs
     */
    public static function getStatistics(array $filters = [])
    {
        $query = self::query();

        // Apply household filter
        if (!empty($filters['household_id'])) {
            $query->where('household_id', $filters['household_id']);
        }

        // Apply change type filter
        if (!empty($filters['change_type'])) {
            $query->where('change_type', $filters['change_type']);
        }

        // Apply time period filter
        if (!empty($filters['time_period'])) {
            $period = $filters['time_period'];
            switch ($period) {
                case 'today':
                    $query->whereDate('created_at', today());
                    break;
                case 'week':
                    $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                    break;
                case 'quarter':
                    $query->whereBetween('created_at', [now()->startOfQuarter(), now()->endOfQuarter()]);
                    break;
            }
        }

        $total = $query->count();
        $pending = (clone $query)->where('status', 'pending_review')->count();
        $approved = (clone $query)->where('status', 'approved')->count();
        $rejected = (clone $query)->where('status', 'rejected')->count();

        // Count by change type
        $byType = (clone $query)
            ->selectRaw('change_type, COUNT(*) as count')
            ->groupBy('change_type')
            ->pluck('count', 'change_type')
            ->toArray();

        return [
            'total' => $total,
            'pending' => $pending,
            'approved' => $approved,
            'rejected' => $rejected,
            'by_type' => $byType,
        ];
    }

    /**
     * Get urgent changes (pending for more than 7 days)
     */
    public static function getUrgent()
    {
        return self::where('status', 'pending_review')
            ->where('created_at', '<', now()->subDays(7))
            ->with(['household', 'reviewedBy'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Get recent changes
     */
    public static function getRecent($limit = 10)
    {
        return self::with(['household', 'reviewedBy'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}

