<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ProgramAnnouncement;

class ProgramAnnouncementCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $programAnnouncement;

    /**
     * Create a new notification instance.
     */
    public function __construct(ProgramAnnouncement $programAnnouncement)
    {
        $this->programAnnouncement = $programAnnouncement;
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
    public function toMail(object $notifiable): MailMessage
    {
        $program = $this->programAnnouncement->program;
        $programName = $program ? $program->name : 'Program';
        
        $message = (new MailMessage)
            ->subject('New Program Announcement: ' . $this->programAnnouncement->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new program announcement has been posted.')
            ->line('**' . $this->programAnnouncement->title . '**')
            ->line('Program: ' . $programName);
        
        if ($this->programAnnouncement->content) {
            $message->line(substr(strip_tags($this->programAnnouncement->content), 0, 200) . '...');
        }
        
        return $message
            ->action('View Announcement', url('/residents/dashboard?section=programs&announcement=' . $this->programAnnouncement->id))
            ->line('Check it out and stay informed!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $program = $this->programAnnouncement->program;
        
        return [
            'type' => 'program_announcement',
            'program_announcement_id' => $this->programAnnouncement->id,
            'program_id' => $this->programAnnouncement->program_id,
            'program_name' => $program ? $program->name : null,
            'title' => 'New Program Announcement',
            'message' => 'A new program announcement has been posted: ' . $this->programAnnouncement->title,
            'announcement_title' => $this->programAnnouncement->title,
            'announcement_content' => $this->programAnnouncement->content ? substr(strip_tags($this->programAnnouncement->content), 0, 150) : null,
            'created_at' => $this->programAnnouncement->created_at->toISOString(),
            'redirect_path' => '/residents/dashboard?section=programs&announcement=' . $this->programAnnouncement->id,
        ];
    }
}

