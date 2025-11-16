<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffProfile extends Model
{
    use HasFactory;

    protected $table = 'staff_profiles';

    protected $casts = [
        'birth_date' => 'date',
        'age' => 'integer',
        'hire_date' => 'date',
        'profile_completed' => 'boolean',
    ];

    protected $fillable = [
        'user_id',
        'staff_id',
        'first_name',
        'middle_name',
        'last_name',
        'name_suffix',
        'birth_date',
        'birth_place',
        'age',
        'nationality',
        'sex',
        'civil_status',
        'religion',
        'email',
        'mobile_number',
        'landline_number',
        'current_address',
        'current_photo',
        'department',
        'position',
        'employee_id',
        'hire_date',
        'employment_status',
        'educational_attainment',
        'work_experience',
        'emergency_contact_name',
        'emergency_contact_number',
        'emergency_contact_relationship',
        'profile_completed',
    ];

    /**
     * Relationship: StaffProfile belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: StaffProfile belongs to a staff member.
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
