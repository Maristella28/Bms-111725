<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaidDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_request_id',
        'receipt_number',
        'amount_paid',
        'payment_method',
        'payment_reference',
        'payment_date',
        'received_by',
        'notes',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'amount_paid' => 'decimal:2',
    ];

    /**
     * Get the document request that owns the payment.
     */
    public function documentRequest(): BelongsTo
    {
        return $this->belongsTo(DocumentRequest::class);
    }

    /**
     * Generate a unique receipt number.
     */
    public static function generateReceiptNumber(): string
    {
        $year = date('Y');
        $lastReceipt = self::where('receipt_number', 'like', "RCP-{$year}-%")
            ->orderBy('receipt_number', 'desc')
            ->first();

        if ($lastReceipt) {
            $lastNumber = (int) substr($lastReceipt->receipt_number, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return "RCP-{$year}-" . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
}
