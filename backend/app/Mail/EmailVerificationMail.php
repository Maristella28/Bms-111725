<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $verificationUrl;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user, $verificationUrl)
    {
        $this->user = $user;
        $this->verificationUrl = $verificationUrl;
    }

    /**
     * Build the message.
     * Using build() method to enable $message->embed() in the view for logo embedding
     */
    public function build()
    {
        $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
        $fromName = config('mail.from.name') ?: 'Barangay e-Governance';
        
        // Set recipient from user email
        $to = $this->user && isset($this->user->email) ? $this->user->email : null;
        
        if (empty($to)) {
            \Log::error('EmailVerificationMail: No recipient email address', [
                'user_id' => $this->user->id ?? null,
            ]);
            throw new \Exception('Cannot send email: recipient email address is required');
    }

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
        
        return $this->from($fromAddress, $fromName)
            ->to($to)
            ->subject('✅ Verify Your Email Address - Barangay e-Governance')
            ->view('emails.verification')
            ->with([
                'user' => $this->user,
                'verificationUrl' => $this->verificationUrl,
                'logoPath' => $logoPath,
            ]);
    }
}
