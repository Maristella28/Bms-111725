<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BlotterRequestApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $blotterRequest;
    public $approvedDate;
    public $approvedTime;
    public $actionUrl;
    protected $logoPath;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $blotterRequest, $approvedDate, $approvedTime, $actionUrl)
    {
        $this->user = $user;
        $this->blotterRequest = $blotterRequest;
        $this->approvedDate = $approvedDate;
        $this->approvedTime = $approvedTime;
        $this->actionUrl = $actionUrl;
        
        // Find logo path for embedding
        $logoPaths = [
            public_path('assets/logo.jpg'),
            public_path('assets/images/logo.jpg'),
            base_path('public/assets/logo.jpg'),
        ];
        
        foreach ($logoPaths as $path) {
            if (file_exists($path) && is_readable($path)) {
                $this->logoPath = $path;
                break;
            }
        }
    }

    /**
     * Build the message.
     * Using build() method to enable $message->embed() in the view for logo embedding
     */
    public function build()
    {
        $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
        
        // Set recipient from user email
        $to = $this->user && isset($this->user->email) ? $this->user->email : null;
        
        if (empty($to)) {
            \Log::error('BlotterRequestApprovedMail: No recipient email address', [
                'user_id' => $this->user->id ?? null,
            ]);
            throw new \Exception('Cannot send email: recipient email address is required');
        }
        
        return $this->from($fromAddress, 'Barangay e-Governance')
            ->to($to)
            ->subject('✅ Blotter Request Approved - Barangay e-Governance')
            ->view('emails.blotter-request-approved')
            ->with([
                'logoPath' => $this->logoPath,
            ]);
    }
}

