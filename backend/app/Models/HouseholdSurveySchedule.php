<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class HouseholdSurveySchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'survey_type',
        'notification_method',
        'frequency',
        'target_households',
        'specific_household_ids',
        'custom_message',
        'is_active',
        'start_date',
        'scheduled_time',
        'day_of_week',
        'day_of_month',
        'last_run_date',
        'next_run_date',
        'total_runs',
        'surveys_sent',
        'created_by_user_id',
    ];

    protected $casts = [
        'specific_household_ids' => 'array',
        'is_active' => 'boolean',
        'start_date' => 'date',
        'last_run_date' => 'datetime',
        'next_run_date' => 'datetime',
        'total_runs' => 'integer',
        'surveys_sent' => 'integer',
    ];

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($schedule) {
            if (empty($schedule->created_by_user_id)) {
                $schedule->created_by_user_id = auth()->id();
            }
            if (empty($schedule->next_run_date)) {
                $schedule->calculateNextRunDate();
            }
        });
    }

    /**
     * Relationship with User
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Relationship with surveys sent by this schedule
     */
    public function surveys()
    {
        return $this->hasMany(HouseholdSurvey::class, 'schedule_id');
    }

    /**
     * Calculate next run date based on frequency
     */
    public function calculateNextRunDate()
    {
        $now = now();
        $startDate = Carbon::parse($this->start_date);
        $time = $this->scheduled_time;

        // If start date is in the future, use it
        if ($startDate->isFuture()) {
            $next = $startDate->setTimeFromTimeString($time);
            $this->next_run_date = $next;
            return $next;
        }

        // Calculate based on frequency
        $next = $now->copy();

        switch ($this->frequency) {
            case 'daily':
                // Next occurrence today or tomorrow
                $next->setTimeFromTimeString($time);
                if ($next->isPast()) {
                    $next->addDay();
                }
                break;

            case 'weekly':
                // Next occurrence on specified day of week
                $targetDay = (int) $this->day_of_week;
                $next->setTimeFromTimeString($time);
                
                // Move to target day
                while ($next->dayOfWeek !== $targetDay || $next->isPast()) {
                    $next->addDay();
                }
                break;

            case 'monthly':
                // Next occurrence on specified day of month
                $targetDay = (int) $this->day_of_month;
                $next->day($targetDay)->setTimeFromTimeString($time);
                
                // If we've passed this month's occurrence, move to next month
                if ($next->isPast()) {
                    $next->addMonth()->day($targetDay);
                }
                break;

            case 'quarterly':
                // Every 3 months
                $next->setTimeFromTimeString($time);
                $next->addMonths(3);
                break;

            case 'annually':
                // Once per year
                $next->setTimeFromTimeString($time);
                $next->addYear();
                break;
        }

        $this->next_run_date = $next;
        return $next;
    }

    /**
     * Check if schedule should run now
     */
    public function shouldRunNow(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if (!$this->next_run_date) {
            return false;
        }

        return $this->next_run_date->isPast();
    }

    /**
     * Execute the schedule (send surveys)
     */
    public function execute()
    {
        if (!$this->is_active) {
            throw new \Exception('Schedule is not active');
        }

        // Get target households
        $households = $this->getTargetHouseholds();

        $surveysSent = 0;

        foreach ($households as $household) {
            try {
                // Create and send survey
                $survey = HouseholdSurvey::create([
                    'household_id' => $household->id,
                    'schedule_id' => $this->id,
                    'survey_type' => $this->survey_type,
                    'notification_method' => $this->notification_method,
                    'questions' => $this->getQuestionsForType($this->survey_type),
                    'custom_message' => $this->custom_message,
                    'expires_at' => now()->addDays(30),
                    'sent_by_user_id' => $this->created_by_user_id,
                    'status' => 'sent',
                ]);

                // Send notification
                $this->sendNotification($survey, $household);

                $surveysSent++;
            } catch (\Exception $e) {
                \Log::error("Failed to send scheduled survey to household {$household->id}: " . $e->getMessage());
            }
        }

        // Update schedule stats
        $this->update([
            'last_run_date' => now(),
            'total_runs' => $this->total_runs + 1,
            'surveys_sent' => $this->surveys_sent + $surveysSent,
        ]);

        // Calculate next run date
        $this->calculateNextRunDate();
        $this->save();

        return $surveysSent;
    }

    /**
     * Get target households for this schedule
     */
    protected function getTargetHouseholds()
    {
        if ($this->target_households === 'all') {
            return Household::all();
        } elseif ($this->target_households === 'specific' && !empty($this->specific_household_ids)) {
            return Household::whereIn('id', $this->specific_household_ids)->get();
        }

        return collect();
    }

    /**
     * Get questions for survey type
     */
    protected function getQuestionsForType($type)
    {
        $questionSets = [
            'comprehensive' => [
                'Are all listed household members still residing at this address?',
                'Have any family members relocated or moved away?',
                'Has any family member passed away?',
                'Are there any new household members (newborns, new residents)?',
                'Has your household address changed?',
                'Is your contact information (phone/email) still correct?',
                'Have there been changes in household income or employment?',
                'Do you need to update benefit eligibility information?',
            ],
            'relocation' => [
                'Are all household members still at the registered address?',
                'Have any members relocated to a different address?',
                'Please provide new addresses for relocated members',
                'Is your household planning to relocate soon?',
            ],
            'deceased' => [
                'Has any household member passed away?',
                'Please provide the name and date of passing',
                'Do you need assistance with death certificate processing?',
                'Should we update benefit allocations?',
            ],
            'contact' => [
                'Is your current contact number still active?',
                'Is your email address correct?',
                'Do you have an alternative contact person?',
                'Preferred method of communication?',
            ],
            'quick' => [
                'Is your household information still accurate?',
                'Any major changes to report?',
                'Need to schedule an in-person verification?',
            ],
        ];

        return $questionSets[$type] ?? $questionSets['quick'];
    }

    /**
     * Send notification to household
     */
    protected function sendNotification(HouseholdSurvey $survey, Household $household)
    {
        try {
            $surveyUrl = $survey->getPublicUrl();

            switch ($this->notification_method) {
                case 'email':
                    if ($household->email) {
                        \Mail::to($household->email)->send(
                            new \App\Mail\HouseholdSurveyMail($survey, $household, $surveyUrl)
                        );
                    }
                    break;

                case 'sms':
                    if ($household->mobilenumber) {
                        // SMS integration here
                        \Log::info("SMS would be sent to: " . $household->mobilenumber);
                    }
                    break;

                case 'both':
                    if ($household->email) {
                        \Mail::to($household->email)->send(
                            new \App\Mail\HouseholdSurveyMail($survey, $household, $surveyUrl)
                        );
                    }
                    if ($household->mobilenumber) {
                        // SMS integration here
                        \Log::info("SMS would be sent to: " . $household->mobilenumber);
                    }
                    break;
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send notification: ' . $e->getMessage());
        }
    }

    /**
     * Get schedules that should run now
     */
    public static function getDueSchedules()
    {
        return self::where('is_active', true)
            ->whereNotNull('next_run_date')
            ->where('next_run_date', '<=', now())
            ->get();
    }

    /**
     * Scope for active schedules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for inactive schedules
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }
}

