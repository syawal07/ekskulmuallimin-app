<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; 
use Laravel\Sanctum\HasApiTokens; 
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Authenticatable
{
    use HasApiTokens, HasFactory; 

    protected $fillable = [
        'name',
        'class',
        'nis',
        'nisn',
        'jenis_kelamin',
        'angkatan',
        'jabatan_organisasi',
        'is_active',
        'foto',
        'excul_id'
    ];

    public function excul()
    {
        return $this->belongsTo(Excul::class);
    }

    public function perkaderanStudents()
    {
        return $this->hasMany(PerkaderanStudent::class, 'student_id');
    }
}