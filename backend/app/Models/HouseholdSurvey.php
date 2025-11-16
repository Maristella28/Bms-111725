<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class HouseholdSurvey extends Model
{
    use HasFactory;

    protected $fillable = [
        'household_id',
        'schedule_id',
        'survey_type',
        'survey_token',
        'notification_method',
        'questions',
        'responses',
        'additional_info',
        'custom_message',
        'status',
        'sent_at',
        'opened_at',
        'completed_at',
        'expires_at',
        'sent_by_user_id',
    ];

    protected $casts = [
        'questions' => 'array',
        'responses' => 'array',
        'additional_info' => 'array',
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'completed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $appends = ['survey_type_label'];

    /**
     * Boot method to generate unique survey token
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($survey) {
            if (empty($survey->survey_token)) {
                $survey->survey_token = self::generateUniqueToken();
            }
            if (empty($survey->status)) {
                $survey->status = 'pending';
            }
            if (empty($survey->sent_at)) {
                $survey->sent_at = now();
            }
        });
    }

    /**
     * Generate a unique survey token
     */
    public static function generateUniqueToken(): string
    {
        do {
            $token = Str::random(32);
        } while (self::where('survey_token', $token)->exists());

        return $token;
    }

    /**
     * Relationship with Household
     */
    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Relationship with User who sent the survey
     */
    public function sentBy()
    {
        return $this->belongsTo(User::class, 'sent_by_user_id');
    }

    /**
     * Relationship with Schedule (if survey was sent by a schedule)
     */
    public function schedule()
    {
        return $this->belongsTo(HouseholdSurveySchedule::class, 'schedule_id');
    }

    /**
     * Get survey type label
     */
    public function getSurveyTypeLabelAttribute()
    {
        $labels = [
            'comprehensive' => 'Comprehensive Household Verification',
            'relocation' => 'Relocation & Address Verification',
            'deceased' => 'Vital Status Update',
            'contact' => 'Contact Information Update',
            'quick' => 'Quick Status Check',
        ];

        return $labels[$this->survey_type] ?? 'Unknown Survey Type';
    }

    /**
     * Scope to get pending surveys
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '>', now());
    }

    /**
     * Scope to get expired surveys
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '<=', now());
    }

    /**
     * Scope to get completed surveys
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Check if survey is expired
     */
    public function isExpired(): bool
    {
        return $this->status === 'pending' && $this->expires_at->isPast();
    }

    /**
     * Mark survey as opened
     */
    public function markAsOpened()
    {
        if (!$this->opened_at) {
            $this->update([
                'opened_at' => now(),
                'status' => 'opened',
            ]);
        }
    }

    /**
     * Mark survey as completed
     */
    public function markAsCompleted(array $responses, array $additionalInfo = [])
    {
        $this->update([
            'responses' => $responses,
            'additional_info' => $additionalInfo,
            'completed_at' => now(),
            'status' => 'completed',
        ]);
    }

    /**
     * Get survey public URL
     */
    public function getPublicUrl(): string
    {
        return config('app.frontend_url') . '/survey/' . $this->survey_token;
    }

    /**
     * Get survey statistics
     */
    public static function getStatistics(array $filters = [])
    {
        $query = self::query();

        // Apply filters
        if (!empty($filters['household_id'])) {
            $query->where('household_id', $filters['household_id']);
        }

        if (!empty($filters['survey_type'])) {
            $query->where('survey_type', $filters['survey_type']);
        }

        if (!empty($filters['time_period'])) {
            $period = $filters['time_period'];
            switch ($period) {
                case 'today':
                    $query->whereDate('sent_at', today());
                    break;
                case 'week':
                    $query->whereBetween('sent_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereMonth('sent_at', now()->month)
                          ->whereYear('sent_at', now()->year);
                    break;
                case 'quarter':
                    $query->whereBetween('sent_at', [now()->startOfQuarter(), now()->endOfQuarter()]);
                    break;
            }
        }

        $total = $query->count();
        $completed = (clone $query)->where('status', 'completed')->count();
        $pending = (clone $query)->where('status', 'pending')->where('expires_at', '>', now())->count();
        $expired = (clone $query)->where('status', 'pending')->where('expires_at', '<=', now())->count();

        $responseRate = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

        return [
            'total' => $total,
            'completed' => $completed,
            'pending' => $pending,
            'expired' => $expired,
            'responseRate' => $responseRate,
        ];
    }
}

