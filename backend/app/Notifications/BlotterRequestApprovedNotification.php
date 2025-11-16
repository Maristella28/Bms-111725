<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Mail\BlotterRequestApprovedMail;

class BlotterRequestApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $blotterRequest;

    public function __construct($blotterRequest)
    {
        $this->blotterRequest = $blotterRequest;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $approvedDateTime = $this->blotterRequest->approved_date
            ? \Carbon\Carbon::parse($this->blotterRequest->approved_date)
            : null;
        $dateStr = $approvedDateTime ? $approvedDateTime->format('F j, Y') : 'N/A';
        $timeStr = $approvedDateTime ? $approvedDateTime->format('g:i A') : 'N/A';
        
        $actionUrl = url('/residents/blotter-requests');
        $appUrl = config('app.frontend_url', config('app.url', 'http://localhost:5173'));
        // Replace backend URL with frontend URL if needed
        if (strpos($actionUrl, config('app.url', 'http://localhost:8000')) !== false) {
            $actionUrl = str_replace(config('app.url', 'http://localhost:8000'), $appUrl, $actionUrl);
        }
        
        // Return Mailable - recipient is set in the Mailable's envelope() method
        // Make sure the user has an email address
        if (!$notifiable->email) {
            \Log::warning('Cannot send email notification: user has no email address', [
                'user_id' => $notifiable->id,
                'blotter_request_id' => $this->blotterRequest->id
            ]);
            // Return a simple MailMessage instead to avoid errors
            return (new MailMessage)
                ->subject('✅ Blotter Request Approved - Barangay e-Governance')
                ->line('Your blotter request has been approved, but we could not send the detailed email because you do not have an email address on file.');
        }
        
        // Create and return the Mailable - recipient is set in envelope()
        return new BlotterRequestApprovedMail(
            $notifiable,
            $this->blotterRequest,
            $dateStr,
            $timeStr,
            $actionUrl
        );
    }

    public function toArray($notifiable)
    {
        $approvedDateTime = $this->blotterRequest->approved_date
            ? \Carbon\Carbon::parse($this->blotterRequest->approved_date)
            : null;
        $dateStr = $approvedDateTime ? $approvedDateTime->format('F j, Y') : null;
        $timeStr = $approvedDateTime ? $approvedDateTime->format('g:i A') : null;
        return [
            'message' => 'Your blotter request (ID: ' . $this->blotterRequest->id . ') has been approved.',
            'blotter_request_id' => $this->blotterRequest->id,
            'status' => 'approved',
            'approved_date' => $dateStr,
            'approved_time' => $timeStr,
            'ticket_number' => $this->blotterRequest->ticket_number,
        ];
    }
} 