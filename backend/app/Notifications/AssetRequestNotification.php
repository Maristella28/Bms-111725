<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AssetRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $asset;
    protected $assetRequest;
    protected $requestDate;
    protected $status;

    public function __construct($assetOrRequest, $requestDateOrStatus = 'pending', $status = null)
    {
        // Handle both old format (single asset) and new format (entire request)
        if (is_object($assetOrRequest) && get_class($assetOrRequest) === 'App\Models\AssetRequest') {
            // New format: entire request
            $this->assetRequest = $assetOrRequest;
            $this->status = $requestDateOrStatus;
            $this->asset = null;
            $this->requestDate = null;
        } else {
            // Old format: single asset (for backward compatibility)
            $this->asset = $assetOrRequest;
            $this->requestDate = $requestDateOrStatus;
            $this->status = $status ?? 'pending';
            $this->assetRequest = null;
        }
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $status = strtolower($this->status);

        if ($this->assetRequest) {
            // New format: entire request
            $items = $this->assetRequest->items ?? collect();
            $itemCount = $items->count();
            $firstItem = $items->first();
            
            $assetItems = $items->map(function($item) {
                return [
                    'name' => $item->asset->name ?? 'Unknown Asset',
                    'quantity' => $item->quantity ?? 1,
                    'request_date' => $item->request_date ?? null,
                ];
            })->toArray();
            
            $requestDate = $firstItem ? ($firstItem->request_date ?? null) : null;
            $customRequestId = $this->assetRequest->custom_request_id ?? null;
            $adminMessage = $this->assetRequest->admin_message ?? null;
            
            // Create a dummy firstItem if none exists
            if (!$firstItem) {
                $firstItem = (object)['asset' => (object)['name' => 'Unknown Asset']];
            }
            
            $statusMessage = $this->getStatusMessage($status, $itemCount, $firstItem);
        } else {
            // Old format: single asset (backward compatibility)
            $assetItems = [[
                'name' => $this->asset->name ?? 'Unknown Asset',
                'quantity' => 1,
                'request_date' => $this->requestDate,
            ]];
            $itemCount = 1;
            $requestDate = $this->requestDate;
            $customRequestId = null;
            $adminMessage = null;
            $firstItem = (object)['asset' => $this->asset];
            $statusMessage = $this->getStatusMessage($status, 1, $firstItem);
        }
        
        // Get status-based styling and content
        $statusConfig = $this->getStatusConfig($status, $itemCount);
        
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
        
        $actionUrl = url('/residents/statusassetrequests');
        
        // Create a custom Mailable instance
        $mailable = new class($notifiable, $status, $statusConfig, $statusMessage, $requestDate, $customRequestId, $itemCount, $assetItems, $adminMessage, $actionUrl, $logoPath) extends Mailable {
            use Queueable, SerializesModels;
            
            public $user;
            public $status;
            public $statusConfig;
            public $statusMessage;
            public $requestDate;
            public $customRequestId;
            public $itemCount;
            public $assetItems;
            public $adminMessage;
            public $actionUrl;
            public $logoPath;
            
            public function __construct($user, $status, $statusConfig, $statusMessage, $requestDate, $customRequestId, $itemCount, $assetItems, $adminMessage, $actionUrl, $logoPath) {
                $this->user = $user;
                $this->status = $status;
                $this->statusConfig = $statusConfig;
                $this->statusMessage = $statusMessage;
                $this->requestDate = $requestDate;
                $this->customRequestId = $customRequestId;
                $this->itemCount = $itemCount;
                $this->assetItems = $assetItems;
                $this->adminMessage = $adminMessage;
                $this->actionUrl = $actionUrl;
                $this->logoPath = $logoPath;
            }
            
            public function build() {
                $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
                $to = $this->user->email ?? null;
                
                if (empty($to)) {
                    \Log::error('AssetRequestNotification: No recipient email address', [
                        'user_id' => $this->user->id ?? null,
                    ]);
                    throw new \Exception('Cannot send email: recipient email address is required');
                }
                
                return $this->from($fromAddress, 'Barangay e-Governance')
                    ->to($to)
                    ->subject($this->statusConfig['subject'])
                    ->view('emails.asset-request')
                    ->with([
                        'user' => $this->user,
                        'status' => $this->status,
                        'headerTitle' => $this->statusConfig['headerTitle'],
                        'headerSubtitle' => $this->statusConfig['headerSubtitle'],
                        'statusMessage' => $this->statusMessage,
                        'statusIcon' => $this->statusConfig['statusIcon'],
                        'headerColorStart' => $this->statusConfig['headerColorStart'],
                        'headerColorEnd' => $this->statusConfig['headerColorEnd'],
                        'accentColor' => $this->statusConfig['accentColor'],
                        'bannerBgColor' => $this->statusConfig['bannerBgColor'],
                        'bannerBorderColor' => $this->statusConfig['bannerBorderColor'],
                        'bannerTextColor' => $this->statusConfig['bannerTextColor'],
                        'descriptionText' => $this->statusConfig['descriptionText'],
                        'requestDate' => $this->requestDate,
                        'customRequestId' => $this->customRequestId,
                        'itemCount' => $this->itemCount,
                        'assetItems' => $this->assetItems,
                        'adminMessage' => $this->adminMessage,
                        'actionUrl' => $this->actionUrl,
                        'logoPath' => $this->logoPath,
                    ]);
            }
        };
        
        return $mailable;
    }
    
    private function getStatusMessage($status, $itemCount, $firstItem)
    {
        $statusLower = strtolower($status);
        $assetName = $firstItem && isset($firstItem->asset) ? ($firstItem->asset->name ?? 'asset') : 'asset';
        
        if ($itemCount === 1) {
            switch ($statusLower) {
                case 'approved':
                    return "Your request for the asset \"{$assetName}\" has been approved.";
                case 'denied':
                case 'rejected':
                    return "Your request for the asset \"{$assetName}\" has been denied.";
                default:
                    return "Your request for the asset \"{$assetName}\" is pending approval.";
            }
        } else if ($itemCount > 1) {
            switch ($statusLower) {
                case 'approved':
                    return "Your request for {$itemCount} assets has been approved.";
                case 'denied':
                case 'rejected':
                    return "Your request for {$itemCount} assets has been denied.";
                default:
                    return "Your request for {$itemCount} assets is pending approval.";
            }
        } else {
            // No items
            switch ($statusLower) {
                case 'approved':
                    return "Your asset request has been approved.";
                case 'denied':
                case 'rejected':
                    return "Your asset request has been denied.";
                default:
                    return "Your asset request is pending approval.";
            }
        }
    }
    
    private function getStatusConfig($status, $itemCount)
    {
        $statusLower = strtolower($status);
        $itemText = $itemCount > 1 ? "{$itemCount} assets" : 'asset';
        
        $configs = [
            'pending' => [
                'subject' => "Asset Request Pending - Barangay e-Governance",
                'headerTitle' => 'Request Pending',
                'headerSubtitle' => 'Your Asset Request Is Under Review',
                'statusIcon' => '⏱',
                'headerColorStart' => '#f59e0b',
                'headerColorEnd' => '#fbbf24',
                'accentColor' => '#f59e0b',
                'bannerBgColor' => '#fffbeb',
                'bannerBorderColor' => '#f59e0b',
                'bannerTextColor' => '#92400e',
                'descriptionText' => "Your asset request is currently under review by our administration team. We will notify you once your request has been processed.",
            ],
            'approved' => [
                'subject' => "✅ Asset Request Approved - Barangay e-Governance",
                'headerTitle' => 'Request Approved',
                'headerSubtitle' => 'Your Asset Request Has Been Successfully Approved',
                'statusIcon' => '✓',
                'headerColorStart' => '#059669',
                'headerColorEnd' => '#10b981',
                'accentColor' => '#059669',
                'bannerBgColor' => '#ecfdf5',
                'bannerBorderColor' => '#10b981',
                'bannerTextColor' => '#065f46',
                'descriptionText' => "Your asset request has been carefully reviewed and approved by the barangay administration. You can now proceed to claim your rented assets at the barangay office.",
            ],
            'denied' => [
                'subject' => "Asset Request Denied - Barangay e-Governance",
                'headerTitle' => 'Request Denied',
                'headerSubtitle' => 'Asset Request Status Update',
                'statusIcon' => '✗',
                'headerColorStart' => '#dc2626',
                'headerColorEnd' => '#ef4444',
                'accentColor' => '#dc2626',
                'bannerBgColor' => '#fef2f2',
                'bannerBorderColor' => '#ef4444',
                'bannerTextColor' => '#991b1b',
                'descriptionText' => "We regret to inform you that your asset request has been denied. Please review the reason provided and contact our office if you need further assistance or wish to reapply.",
            ],
            'rejected' => [
                'subject' => "Asset Request Rejected - Barangay e-Governance",
                'headerTitle' => 'Request Rejected',
                'headerSubtitle' => 'Asset Request Status Update',
                'statusIcon' => '✗',
                'headerColorStart' => '#dc2626',
                'headerColorEnd' => '#ef4444',
                'accentColor' => '#dc2626',
                'bannerBgColor' => '#fef2f2',
                'bannerBorderColor' => '#ef4444',
                'bannerTextColor' => '#991b1b',
                'descriptionText' => "We regret to inform you that your asset request has been rejected. Please review the reason provided and contact our office if you need further assistance or wish to reapply.",
            ],
        ];
        
        // Default configuration for unknown statuses
        $defaultConfig = [
            'subject' => "Asset Request Update - Barangay e-Governance",
            'headerTitle' => 'Request Update',
            'headerSubtitle' => 'Asset Request Status Update',
            'statusIcon' => 'ℹ',
            'headerColorStart' => '#6b7280',
            'headerColorEnd' => '#9ca3af',
            'accentColor' => '#6b7280',
            'bannerBgColor' => '#f9fafb',
            'bannerBorderColor' => '#6b7280',
            'bannerTextColor' => '#374151',
            'descriptionText' => "Your asset request status has been updated. Please check your account dashboard for more details.",
        ];
        
        return $configs[$statusLower] ?? $defaultConfig;
    }

    public function toArray($notifiable)
    {
        $statusMsg = $this->status === 'approved'
            ? 'approved'
            : ($this->status === 'denied' ? 'denied' : 'pending approval');

        if ($this->assetRequest) {
            // New format: entire request
            $items = $this->assetRequest->items;
            $itemCount = $items->count();
            $firstItem = $items->first();
            
            $message = '';
            if ($itemCount === 1) {
                $message = 'Your request for the asset "' . $firstItem->asset->name . '" has been ' . $statusMsg . '.';
            } else {
                $message = 'Your request for ' . $itemCount . ' assets has been ' . $statusMsg . '.';
            }
            
            return [
                'message' => $message,
                'type' => 'asset_request',
                'asset_request_id' => $this->assetRequest->id,
                'custom_request_id' => $this->assetRequest->custom_request_id,
                'status' => $this->status,
                'item_count' => $itemCount,
                'items' => $items->map(function($item) {
                    return [
                        'asset_id' => $item->asset->id,
                        'asset_name' => $item->asset->name,
                        'quantity' => $item->quantity,
                        'request_date' => $item->request_date,
                    ];
                })->toArray(),
                'request_date' => $firstItem->request_date,
            ];
        } else {
            // Old format: single asset (backward compatibility)
            return [
                'message' => 'Your request for the asset "' . $this->asset->name . '" has been ' . $statusMsg . '.',
                'asset_id' => $this->asset->id,
                'asset_name' => $this->asset->name,
                'request_date' => $this->requestDate,
                'status' => $this->status,
            ];
        }
    }
} 