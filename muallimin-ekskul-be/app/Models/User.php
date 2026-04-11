<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    // HasApiTokens untuk fitur Login API nanti
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

    // Relasi: Guru mengampu ekskul apa saja (Many-to-Many via excul_user)
    public function mentoringExculs()
    {
        return $this->belongsToMany(Excul::class, 'excul_user', 'user_id', 'excul_id');
    }

    // Relasi: Presensi yang dicatat oleh user ini
    public function recordedAttendances()
    {
        return $this->hasMany(Attendance::class, 'recorder_id');
    }
}