<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\DocumentRequest;

class DocumentRequestStatusNotification extends Notification
{
    use Queueable;

    protected $documentRequest;
    protected $statusChange;
    protected $customMessage;

    /**
     * Create a new notification instance.
     */
    public function __construct(DocumentRequest $documentRequest, $statusChange = null, $customMessage = null)
    {
        $this->documentRequest = $documentRequest;
        $this->statusChange = $statusChange;
        $this->customMessage = $customMessage;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
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
        $status = strtolower($this->documentRequest->status);
        $documentType = $this->documentRequest->document_type;
        $certificationType = $this->documentRequest->certification_type;
        $docName = $certificationType ? "{$certificationType}" : $documentType;
        
        // Get status-based styling and content
        $statusConfig = $this->getStatusConfig($status, $docName);
        
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

        $actionUrl = url('/residents/documents/status');
        $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
        $to = $notifiable->email ?? null;
        
        if (empty($to)) {
            \Log::error('DocumentRequestStatusNotification: No recipient email address', [
                'user_id' => $notifiable->id ?? null,
            ]);
            throw new \Exception('Cannot send email: recipient email address is required');
        }
        
        // Use custom message if provided
        $statusMessage = $this->customMessage ?? $statusConfig['statusMessage'];
        $statusConfig['statusMessage'] = $statusMessage;
        
        // Create a custom Mailable instance
        $mailable = new class($notifiable, $this->documentRequest, $statusConfig, $docName, $status, $actionUrl, $logoPath) extends Mailable {
            use Queueable, SerializesModels;
            
            public $user;
            public $documentRequest;
            public $statusConfig;
            public $docName;
            public $status;
            public $actionUrl;
            public $logoPath;
            
            public function __construct($user, $documentRequest, $statusConfig, $docName, $status, $actionUrl, $logoPath) {
                $this->user = $user;
                $this->documentRequest = $documentRequest;
                $this->statusConfig = $statusConfig;
                $this->docName = $docName;
                $this->status = $status;
                $this->actionUrl = $actionUrl;
                $this->logoPath = $logoPath;
            }
            
            public function build() {
                $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
                $to = $this->user->email ?? null;
                
                return $this->from($fromAddress, 'Barangay e-Governance')
                    ->to($to)
                    ->subject($this->statusConfig['subject'])
                    ->view('emails.document-request-status')
                    ->with([
                        'user' => $this->user,
                        'documentRequest' => $this->documentRequest,
                        'docName' => $this->docName,
                        'status' => $this->status,
                        'headerTitle' => $this->statusConfig['headerTitle'],
                        'headerSubtitle' => $this->statusConfig['headerSubtitle'],
                        'statusMessage' => $this->statusConfig['statusMessage'],
                        'statusIcon' => $this->statusConfig['statusIcon'],
                        'headerColorStart' => $this->statusConfig['headerColorStart'],
                        'headerColorEnd' => $this->statusConfig['headerColorEnd'],
                        'accentColor' => $this->statusConfig['accentColor'],
                        'bannerBgColor' => $this->statusConfig['bannerBgColor'],
                        'bannerBorderColor' => $this->statusConfig['bannerBorderColor'],
                        'bannerTextColor' => $this->statusConfig['bannerTextColor'],
                        'descriptionText' => $this->statusConfig['descriptionText'],
                        'actionUrl' => $this->actionUrl,
                        'logoPath' => $this->logoPath,
                    ]);
            }
        };
        
        return $mailable;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $status = $this->documentRequest->status;
        $documentType = $this->documentRequest->document_type;
        $certificationType = $this->documentRequest->certification_type;
        
        // Create appropriate message based on status
        $message = $this->getStatusMessage($status, $documentType, $certificationType);
        
        return [
            'type' => 'document_request_status',
            'document_request_id' => $this->documentRequest->id,
            'document_type' => $documentType,
            'certification_type' => $certificationType,
            'status' => $status,
            'previous_status' => $this->statusChange['from'] ?? null,
            'message' => $message,
            'title' => 'Document Request Update',
            'icon' => $this->getStatusIcon($status),
            'color' => $this->getStatusColor($status),
            'action_url' => '/residents/documents/status',
            'created_at' => now()->toISOString(),
        ];
    }

    private function getStatusConfig($status, $docName)
    {
        $configs = [
            'pending' => [
                'subject' => "Document Request Received - {$docName}",
                'headerTitle' => 'Request Received',
                'headerSubtitle' => 'Your Document Request Has Been Submitted',
                'statusMessage' => "Your {$docName} request has been received and is pending review by our administration team.",
                'statusIcon' => '⏱',
                'headerColorStart' => '#f59e0b',
                'headerColorEnd' => '#fbbf24',
                'accentColor' => '#f59e0b',
                'bannerBgColor' => '#fffbeb',
                'bannerBorderColor' => '#f59e0b',
                'bannerTextColor' => '#92400e',
                'descriptionText' => "Your document request has been successfully submitted and is now in our queue. Our team will review your request and notify you once it has been processed.",
            ],
            'processing' => [
                'subject' => "Document Request Processing - {$docName}",
                'headerTitle' => 'Processing Request',
                'headerSubtitle' => 'Your Document Request Is Being Processed',
                'statusMessage' => "Your {$docName} request is now being processed by our office. We will notify you once your document is ready for pickup.",
                'statusIcon' => '⚙',
                'headerColorStart' => '#3b82f6',
                'headerColorEnd' => '#60a5fa',
                'accentColor' => '#3b82f6',
                'bannerBgColor' => '#eff6ff',
                'bannerBorderColor' => '#3b82f6',
                'bannerTextColor' => '#1e40af',
                'descriptionText' => "Your document request is currently being processed by our administration team. Please wait for further updates regarding the status of your request.",
            ],
            'approved' => [
                'subject' => "✅ Document Request Approved - {$docName}",
                'headerTitle' => 'Request Approved',
                'headerSubtitle' => 'Your Document Request Has Been Successfully Approved',
                'statusMessage' => $this->documentRequest->payment_amount > 0 
                    ? "Great news! Your {$docName} request has been approved. Payment of ₱" . number_format($this->documentRequest->payment_amount, 2) . " is required."
                    : "Great news! Your {$docName} request has been approved and is ready for pickup.",
                'statusIcon' => '✓',
                'headerColorStart' => '#059669',
                'headerColorEnd' => '#10b981',
                'accentColor' => '#059669',
                'bannerBgColor' => '#ecfdf5',
                'bannerBorderColor' => '#10b981',
                'bannerTextColor' => '#065f46',
                'descriptionText' => "Your document request has been carefully reviewed and approved by the barangay administration. You can now track the status, view complete details, and manage your request through your account dashboard.",
            ],
            'rejected' => [
                'subject' => "Document Request Declined - {$docName}",
                'headerTitle' => 'Request Declined',
                'headerSubtitle' => 'Document Request Status Update',
                'statusMessage' => "Your {$docName} request has been declined. Please contact our office if you have any questions or wish to reapply.",
                'statusIcon' => '✗',
                'headerColorStart' => '#dc2626',
                'headerColorEnd' => '#ef4444',
                'accentColor' => '#dc2626',
                'bannerBgColor' => '#fef2f2',
                'bannerBorderColor' => '#ef4444',
                'bannerTextColor' => '#991b1b',
                'descriptionText' => "We regret to inform you that your document request has been declined. Please review the reason provided and contact our office if you need further assistance or wish to reapply.",
            ],
            'denied' => [
                'subject' => "Document Request Denied - {$docName}",
                'headerTitle' => 'Request Denied',
                'headerSubtitle' => 'Document Request Status Update',
                'statusMessage' => "Your {$docName} request has been denied. Please contact our office if you have any questions or wish to reapply.",
                'statusIcon' => '✗',
                'headerColorStart' => '#dc2626',
                'headerColorEnd' => '#ef4444',
                'accentColor' => '#dc2626',
                'bannerBgColor' => '#fef2f2',
                'bannerBorderColor' => '#ef4444',
                'bannerTextColor' => '#991b1b',
                'descriptionText' => "We regret to inform you that your document request has been denied. Please review the reason provided and contact our office if you need further assistance or wish to reapply.",
            ],
            'completed' => [
                'subject' => "✅ Document Request Completed - {$docName}",
                'headerTitle' => 'Request Completed',
                'headerSubtitle' => 'Your Document Request Has Been Completed',
                'statusMessage' => "Your {$docName} has been completed and is available for download or pickup.",
                'statusIcon' => '✓',
                'headerColorStart' => '#10b981',
                'headerColorEnd' => '#34d399',
                'accentColor' => '#10b981',
                'bannerBgColor' => '#ecfdf5',
                'bannerBorderColor' => '#10b981',
                'bannerTextColor' => '#065f46',
                'descriptionText' => "Your document request has been successfully completed. You can now download your document or pick it up at the barangay office.",
            ],
        ];
        
        // Default configuration for unknown statuses
        $defaultConfig = [
            'subject' => "Document Request Update - {$docName}",
            'headerTitle' => 'Request Update',
            'headerSubtitle' => 'Document Request Status Update',
            'statusMessage' => "Your {$docName} request status has been updated to: " . ucfirst($status) . ".",
            'statusIcon' => 'ℹ',
            'headerColorStart' => '#6b7280',
            'headerColorEnd' => '#9ca3af',
            'accentColor' => '#6b7280',
            'bannerBgColor' => '#f9fafb',
            'bannerBorderColor' => '#6b7280',
            'bannerTextColor' => '#374151',
            'descriptionText' => "Your document request status has been updated. Please check your account dashboard for more details.",
        ];
        
        return $configs[$status] ?? $defaultConfig;
    }

    private function getStatusMessage($status, $documentType, $certificationType = null)
    {
        $docName = $certificationType ? "{$certificationType}" : $documentType;
        
        switch (strtolower($status)) {
            case 'pending':
                return "Your {$docName} request has been received and is pending review.";
            case 'processing':
                return "Your {$docName} request is now being processed by our office.";
            case 'approved':
                return "Great news! Your {$docName} request has been approved and is ready for pickup.";
            case 'rejected':
                return "Your {$docName} request has been declined. Please contact our office for more information.";
            case 'completed':
                return "Your {$docName} has been completed and is available for download.";
            default:
                return "Your {$docName} request status has been updated to: {$status}.";
        }
    }

    private function getStatusIcon($status)
    {
        switch (strtolower($status)) {
            case 'pending':
                return 'clock';
            case 'processing':
                return 'cog';
            case 'approved':
                return 'check-circle';
            case 'rejected':
                return 'x-circle';
            case 'completed':
                return 'document-check';
            default:
                return 'bell';
        }
    }

    private function getStatusColor($status)
    {
        switch (strtolower($status)) {
            case 'pending':
                return 'yellow';
            case 'processing':
                return 'blue';
            case 'approved':
                return 'green';
            case 'rejected':
                return 'red';
            case 'completed':
                return 'emerald';
            default:
                return 'gray';
        }
    }
}