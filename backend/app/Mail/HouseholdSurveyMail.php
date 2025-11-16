<?php

namespace App\Mail;

use App\Models\HouseholdSurvey;
use App\Models\Household;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HouseholdSurveyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $survey;
    public $household;
    public $surveyUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(HouseholdSurvey $survey, Household $household, string $surveyUrl)
    {
        $this->survey = $survey;
        $this->household = $household;
        $this->surveyUrl = $surveyUrl;
    }

    /**
     * Build the message.
     * Using build() method to enable $message->embed() in the view for logo embedding
     */
    public function build()
    {
        $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
        
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
        
        return $this->from($fromAddress, 'Barangay e-Governance')
            ->subject('📋 Household Verification Survey - ' . $this->survey->survey_type_label)
            ->view('emails.household-survey')
            ->with([
                'survey' => $this->survey,
                'household' => $this->household,
                'surveyUrl' => $this->surveyUrl,
                'expiresAt' => $this->survey->expires_at->format('F j, Y'),
                'logoPath' => $logoPath,
            ]);
    }

}

