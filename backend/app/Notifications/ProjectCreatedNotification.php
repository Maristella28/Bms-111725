<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Project;

class ProjectCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $project;

    /**
     * Create a new notification instance.
     */
    public function __construct(Project $project)
    {
        $this->project = $project;
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
        $message = (new MailMessage)
            ->subject('New Barangay Project: ' . $this->project->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new Barangay project has been posted.')
            ->line('**' . $this->project->name . '**')
            ->line('Owner: ' . $this->project->owner)
            ->line('Status: ' . $this->project->status);
        
        if ($this->project->deadline) {
            $message->line('Deadline: ' . $this->project->deadline->format('F j, Y'));
        }
        
        return $message
            ->action('View Project', url('/residents/projects?id=' . $this->project->id))
            ->line('Stay updated on our community projects!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'project',
            'project_id' => $this->project->id,
            'project_name' => $this->project->name,
            'title' => 'New Project Posted',
            'message' => 'A new Barangay project has been posted: ' . $this->project->name,
            'project_owner' => $this->project->owner,
            'project_status' => $this->project->status,
            'created_at' => $this->project->created_at->toISOString(),
            'redirect_path' => '/residents/projects?id=' . $this->project->id,
        ];
    }
}

