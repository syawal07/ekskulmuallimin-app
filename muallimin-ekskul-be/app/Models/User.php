<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'username',
        'password',
        'name',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function mentoringExculs()
    {
        return $this->belongsToMany(Excul::class, 'excul_user', 'user_id', 'excul_id');
    }

    public function recordedAttendances()
    {
        return $this->hasMany(Attendance::class, 'recorder_id');
    }

    public function perkaderans()
    {
        return $this->belongsToMany(Perkaderan::class, 'perkaderan_user', 'user_id', 'perkaderan_id');
    }
}