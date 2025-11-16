<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetRequestItem extends Model
{
    protected $fillable = [
        'asset_request_id', 'asset_id', 'request_date', 'start_time', 'end_time', 'quantity', 'notes',
        'rental_duration_days', 'return_date', 'is_returned', 'returned_at',
        'tracking_number', 'tracking_generated_at', 'tracking_generated_by', 'rating'
    ];

    protected $casts = [
        'request_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'return_date' => 'datetime',
        'returned_at' => 'datetime',
        'is_returned' => 'boolean',
        'rental_duration_days' => 'integer',
        'tracking_generated_at' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(RequestableAsset::class, 'asset_id');
    }

    public function request()
    {
        return $this->belongsTo(AssetRequest::class, 'asset_request_id');
    }

    /**
     * Calculate return date based on request date and rental duration
     */
    public function calculateReturnDate()
    {
        if (!$this->return_date && $this->request_date && $this->rental_duration_days) {
            $this->return_date = \Carbon\Carbon::parse($this->request_date)->addDays($this->rental_duration_days);
            $this->save();
        }
        return $this->return_date;
    }

    /**
     * Get remaining rental time
     */
    public function getRemainingRentalTime()
    {
        $returnDate = $this->calculateReturnDate();
        if (!$returnDate) {
            return null;
        }

        $now = now();
        $remaining = $returnDate->diffInDays($now, false);
        
        return [
            'days_remaining' => max(0, $remaining),
            'is_overdue' => $remaining < 0,
            'return_date' => $returnDate,
            'is_returned' => $this->is_returned
        ];
    }

    /**
     * Check if asset needs to be returned
     */
    public function needsReturn()
    {
        $remaining = $this->getRemainingRentalTime();
        return $remaining && $remaining['days_remaining'] <= 0 && !$this->is_returned;
    }

    /**
     * Mark asset as returned
     */
    public function markAsReturned()
    {
        $this->update([
            'is_returned' => true,
            'returned_at' => now()
        ]);
    }

    /**
     * Generate and set tracking number
     */
    public function generateTrackingNumber($generatedBy = null)
    {
        if ($this->tracking_number) {
            return $this->tracking_number; // Already has tracking number
        }

        // Format request date for tracking number
        $requestDate = $this->request_date ? \Carbon\Carbon::parse($this->request_date)->format('mdY') : date('mdY');
        
        // Create tracking number with format: TRK{request_id}-{rental_duration}D-{request_date}
        $trackingNumber = sprintf(
            'TRK%06d-%dD-%s',
            $this->asset_request_id,
            $this->rental_duration_days ?? 1,
            $requestDate
        );

        $this->update([
            'tracking_number' => $trackingNumber,
            'tracking_generated_at' => now(),
            'tracking_generated_by' => $generatedBy
        ]);

        return $trackingNumber;
    }

    /**
     * Check if tracking number is generated
     */
    public function hasTrackingNumber()
    {
        return !empty($this->tracking_number);
    }

    /**
     * Get tracking information
     */
    public function getTrackingInfo()
    {
        return [
            'tracking_number' => $this->tracking_number,
            'generated_at' => $this->tracking_generated_at,
            'generated_by' => $this->tracking_generated_by,
            'has_tracking' => $this->hasTrackingNumber()
        ];
    }
} 