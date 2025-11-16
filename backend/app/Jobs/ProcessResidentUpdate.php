<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Resident;
use App\Models\ActivityLog;

class ProcessResidentUpdate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $residentId;
    public $updateData;
    public $userId;
    public $attempts = 3;
    public $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct($residentId, $updateData, $userId = null)
    {
        $this->residentId = $residentId;
        $this->updateData = $updateData;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            DB::transaction(function() {
                $resident = Resident::lockForUpdate()->findOrFail($this->residentId);
                
                // Check version for optimistic locking
                if (isset($this->updateData['version']) && 
                    $resident->version !== $this->updateData['version']) {
                    throw new \Exception('Record was modified by another user');
                }
                
                // Increment version
                $this->updateData['version'] = $resident->version + 1;
                
                $resident->update($this->updateData);
                
                // Log successful update
                ActivityLog::create([
                    'user_id' => $this->userId,
                    'action' => 'resident_updated_async',
                    'model_type' => 'Resident',
                    'model_id' => $this->residentId,
                    'changes' => $this->updateData,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent()
                ]);
                
                Log::info('Resident updated successfully via queue', [
                    'resident_id' => $this->residentId,
                    'user_id' => $this->userId,
                    'attempt' => $this->attempts()
                ]);
            });
            
        } catch (\Exception $e) {
            Log::error('Resident update failed in queue', [
                'resident_id' => $this->residentId,
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts()
            ]);
            
            throw $e; // Re-throw to trigger retry mechanism
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Resident update job failed permanently', [
            'resident_id' => $this->residentId,
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts()
        ]);
        
        // Could send notification to admin here
        // Notification::route('mail', config('mail.admin_email'))
        //     ->notify(new JobFailedNotification($this, $exception));
    }
}
