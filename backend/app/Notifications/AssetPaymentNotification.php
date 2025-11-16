<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AssetPaymentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $assetRequest;
    protected $receiptNumber;
    protected $amount;

    public function __construct($assetRequest, $receiptNumber, $amount)
    {
        $this->assetRequest = $assetRequest;
        $this->receiptNumber = $receiptNumber;
        $this->amount = $amount;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $items = $this->assetRequest->items ?? collect();
        $assetItems = $items->map(function($item) {
            return [
                'name' => $item->asset->name ?? 'Unknown Asset',
                'quantity' => $item->quantity ?? 1,
                'request_date' => $item->request_date ?? null,
            ];
        })->toArray();
        
        $firstItem = $items->first();
        $requestDate = $firstItem->request_date ?? null;
        $paymentDate = now()->format('F j, Y');
        
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
        $mailable = new class($notifiable, $this->receiptNumber, $this->amount, $requestDate, $paymentDate, $assetItems, $actionUrl, $logoPath) extends Mailable {
            use Queueable, SerializesModels;
            
            public $user;
            public $receiptNumber;
            public $amount;
            public $requestDate;
            public $paymentDate;
            public $assetItems;
            public $actionUrl;
            public $logoPath;
            
            public function __construct($user, $receiptNumber, $amount, $requestDate, $paymentDate, $assetItems, $actionUrl, $logoPath) {
                $this->user = $user;
                $this->receiptNumber = $receiptNumber;
                $this->amount = $amount;
                $this->requestDate = $requestDate;
                $this->paymentDate = $paymentDate;
                $this->assetItems = $assetItems;
                $this->actionUrl = $actionUrl;
                $this->logoPath = $logoPath;
            }
            
            public function build() {
                $fromAddress = config('mail.from.address') ?: 'admin@barangay.local';
                $to = $this->user->email ?? null;
                
                if (empty($to)) {
                    \Log::error('AssetPaymentNotification: No recipient email address', [
                        'user_id' => $this->user->id ?? null,
                    ]);
                    throw new \Exception('Cannot send email: recipient email address is required');
                }
                
                return $this->from($fromAddress, 'Barangay e-Governance')
                    ->to($to)
                    ->subject('✅ Asset Payment Receipt - ' . $this->receiptNumber)
                    ->view('emails.asset-payment')
                    ->with([
                        'user' => $this->user,
                        'receiptNumber' => $this->receiptNumber,
                        'amount' => $this->amount,
                        'requestDate' => $this->requestDate,
                        'paymentDate' => $this->paymentDate,
                        'assetItems' => $this->assetItems,
                        'actionUrl' => $this->actionUrl,
                        'logoPath' => $this->logoPath,
                    ]);
            }
        };
        
        return $mailable;
    }

    public function toArray($notifiable)
    {
        $assetName = $this->assetRequest->items->first()?->asset->name ?? 'Unknown Asset';
        
        return [
            'message' => 'Payment received for asset "' . $assetName . '". Receipt #' . $this->receiptNumber,
            'type' => 'asset_payment',
            'asset_request_id' => $this->assetRequest->id,
            'receipt_number' => $this->receiptNumber,
            'amount' => $this->amount,
            'asset_name' => $assetName,
        ];
    }
} 