<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Program;

class ProgramCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $program;

    /**
     * Create a new notification instance.
     */
    public function __construct(Program $program)
    {
        $this->program = $program;
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
            ->subject('New Program Available: ' . $this->program->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new program is now available for registration.')
            ->line('**' . $this->program->name . '**');
        
        if ($this->program->description) {
            $message->line(substr(strip_tags($this->program->description), 0, 200) . '...');
        }
        
        if ($this->program->amount) {
            $message->line('Amount: ₱' . number_format($this->program->amount, 2));
        }
        
        return $message
            ->action('View Program', url('/residents/dashboard?section=programs&program=' . $this->program->id))
            ->line('Check it out and apply if you qualify!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'program_announcement',
            'program_id' => $this->program->id,
            'program_name' => $this->program->name,
            'title' => 'New Program Available',
            'message' => 'A new program is now available: ' . $this->program->name,
            'program_description' => $this->program->description ? substr(strip_tags($this->program->description), 0, 150) : null,
            'program_amount' => $this->program->amount,
            'created_at' => $this->program->created_at->toISOString(),
            'redirect_path' => '/residents/dashboard?section=programs&program=' . $this->program->id,
        ];
    }
}

