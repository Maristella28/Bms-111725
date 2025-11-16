<?php

namespace App\Jobs;

use App\Models\Announcement;
use App\Models\User;
use App\Notifications\AnnouncementCreatedNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendAnnouncementNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $announcement;

    /**
     * Create a new job instance.
     */
    public function __construct(Announcement $announcement)
    {
        $this->announcement = $announcement;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Get all resident users (role = 'resident' or 'residents')
            $residentUsers = User::whereIn('role', ['resident', 'residents'])
                ->whereNotNull('email')
                ->get();

            $notification = new AnnouncementCreatedNotification($this->announcement);
            
            foreach ($residentUsers as $user) {
                try {
                    $user->notify($notification);
                } catch (\Exception $e) {
                    Log::warning('Failed to send announcement notification to user', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('Announcement notifications sent to all residents', [
                'announcement_id' => $this->announcement->id,
                'recipients_count' => $residentUsers->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send announcement notifications to residents', [
                'announcement_id' => $this->announcement->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}

