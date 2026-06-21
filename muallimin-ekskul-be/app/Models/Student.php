<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $fillable = ['name', 'nis', 'class', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function exculs()
    {
        return $this->belongsToMany(Excul::class, 'excul_student')
                    ->withPivot('academic_year_id', 'is_active')
                    ->withTimestamps();
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function perkaderans()
    {
        return $this->hasMany(PerkaderanStudent::class, 'student_id');
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }
}