<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $fillable = ['name', 'nis', 'class', 'is_active', 'excul_id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function excul()
    {
        return $this->belongsTo(Excul::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }
}