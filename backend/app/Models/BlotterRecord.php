<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlotterRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'case_number',
        'resident_id',
        'complainant_name',
        'complainant_contact_number',
        'complainant_email',
        'complainant_address',
        'respondent_name',
        'respondent_contact_number',
        'respondent_email',
        'respondent_address',
        'complaint_type',
        'complaint_details',
        'incident_date',
        'incident_time',
        'incident_location',
        'witnesses',
        'supporting_documents',
        'preferred_action',
        'contact_number',
        'email',
        'remarks',
        'status',
        'solved_at',
        'appointment_date',
        'appointment_time',
        'notification_sent_at',
        // No-show tracking fields
        'complainant_no_show',
        'respondent_no_show',
        'complainant_no_show_at',
        'respondent_no_show_at',
        'complainant_no_show_reason',
        'respondent_no_show_reason',
        'complainant_appeal_submitted',
        'respondent_appeal_submitted',
        'complainant_appeal_reason',
        'respondent_appeal_reason',
        'complainant_appeal_status',
        'respondent_appeal_status',
        'complainant_appeal_reviewed_at',
        'respondent_appeal_reviewed_at',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'resident_id');
    }

    // Mutator to handle solved_at date format
    public function setSolvedAtAttribute($value)
    {
        if ($value) {
            // Convert ISO 8601 format to MySQL datetime format
            $this->attributes['solved_at'] = \Carbon\Carbon::parse($value)->format('Y-m-d H:i:s');
        } else {
            $this->attributes['solved_at'] = $value;
        }
    }
} 