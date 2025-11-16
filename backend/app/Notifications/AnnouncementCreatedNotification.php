<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Announcement;

class AnnouncementCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $announcement;

    /**
     * Create a new notification instance.
     */
    public function __construct(Announcement $announcement)
    {
        $this->announcement = $announcement;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable)
    {
        // Get announcement styling and content configuration
        $config = $this->getAnnouncementConfig();
        
        // Find logo path for embedding
        $logoPath = null;
        $logoPaths = [
            public_path('assets/logo.jpg'),
            public_path('assets/images/logo.jpg'),
            base_path('public/assets/logo.jpg'),
        ];
        
        foreach ($logoPaths as $path) {
            if (file_exists($path) && is_readable($path)) {
                $logoPath = $path;
                break;
            }
        }

        $actionUrl = url('/residents/dashboard?tab=announcements&id=' . $this->announcement->id);
        $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
        $to = $notifiable->email ?? null;
        
        if (empty($to)) {
            \Log::error('AnnouncementCreatedNotification: No recipient email address', [
                'user_id' => $notifiable->id ?? null,
            ]);
            throw new \Exception('Cannot send email: recipient email address is required');
        }
        
        // Create a custom Mailable instance
        $mailable = new class($notifiable, $this->announcement, $config, $actionUrl, $logoPath) extends Mailable {
            use Queueable, SerializesModels;
            
            public $user;
            public $announcement;
            public $config;
            public $actionUrl;
            public $logoPath;
            
            public function __construct($user, $announcement, $config, $actionUrl, $logoPath) {
                $this->user = $user;
                $this->announcement = $announcement;
                $this->config = $config;
                $this->actionUrl = $actionUrl;
                $this->logoPath = $logoPath;
            }
            
            public function build() {
                $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
                $to = $this->user->email ?? null;
                
                return $this->from($fromAddress, 'Barangay e-Governance')
                    ->to($to)
                    ->subject($this->config['subject'])
                    ->view('emails.announcement-created')
                    ->with([
                        'user' => $this->user,
                        'announcement' => $this->announcement,
                        'headerTitle' => $this->config['headerTitle'],
                        'headerSubtitle' => $this->config['headerSubtitle'],
                        'statusMessage' => $this->config['statusMessage'],
                        'statusIcon' => $this->config['statusIcon'],
                        'headerColorStart' => $this->config['headerColorStart'],
                        'headerColorEnd' => $this->config['headerColorEnd'],
                        'accentColor' => $this->config['accentColor'],
                        'bannerBgColor' => $this->config['bannerBgColor'],
                        'bannerBorderColor' => $this->config['bannerBorderColor'],
                        'bannerTextColor' => $this->config['bannerTextColor'],
                        'descriptionText' => $this->config['descriptionText'],
                        'actionUrl' => $this->actionUrl,
                        'logoPath' => $this->logoPath,
                    ]);
            }
        };
        
        return $mailable;
    }

    /**
     * Get announcement email configuration.
     */
    private function getAnnouncementConfig()
    {
        return [
            'subject' => 'New Announcement: ' . $this->announcement->title,
            'headerTitle' => 'New Announcement',
            'headerSubtitle' => 'Important Information from Barangay',
            'statusMessage' => 'A new announcement has been posted by the Barangay Administration.',
            'statusIcon' => '📢',
            'headerColorStart' => '#3b82f6',
            'headerColorEnd' => '#60a5fa',
            'accentColor' => '#3b82f6',
            'bannerBgColor' => '#eff6ff',
            'bannerBorderColor' => '#3b82f6',
            'bannerTextColor' => '#1e40af',
            'descriptionText' => 'We encourage you to review this announcement carefully and take any necessary action. Stay informed about important updates from your Barangay.',
        ];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'announcement',
            'announcement_id' => $this->announcement->id,
            'title' => 'New Announcement Posted',
            'message' => 'A new announcement has been posted: ' . $this->announcement->title,
            'announcement_title' => $this->announcement->title,
            'announcement_content' => substr(strip_tags($this->announcement->content), 0, 150),
            'created_at' => $this->announcement->created_at->toISOString(),
            'redirect_path' => '/residents/dashboard?tab=announcements&id=' . $this->announcement->id,
        ];
    }
}

