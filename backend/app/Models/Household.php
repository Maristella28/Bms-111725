<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Household extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'households';

    protected $fillable = [
        'household_no',
        'address',
        'head_resident_id',
        'members_count',
        'created_by',
    ];

    protected $casts = [
        'members_count' => 'integer',
    ];

    public function residents()
    {
        return $this->hasMany(Resident::class, 'household_no', 'household_no');
    }

    public function head()
    {
        return $this->belongsTo(Resident::class, 'head_resident_id');
    }

    public function surveys()
    {
        return $this->hasMany(HouseholdSurvey::class);
    }

    public function changeLogs()
    {
        return $this->hasMany(HouseholdChangeLog::class);
    }

    /**
     * Get household head's email
     */
    public function getHeadEmailAttribute()
    {
        return $this->head?->email ?? null;
    }

    /**
     * Get household head's mobile number
     */
    public function getHeadMobileAttribute()
    {
        return $this->head?->mobile_number ?? null;
    }

    /**
     * Get household head's full name
     */
    public function getHeadFullNameAttribute()
    {
        if (!$this->head) {
            return 'N/A';
        }
        $name = trim($this->head->first_name . ' ' . $this->head->middle_name . ' ' . $this->head->last_name);
        if ($this->head->name_suffix) {
            $name .= ' ' . $this->head->name_suffix;
        }
        return $name;
    }
}
