<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerkaderanStudent extends Model
{
    protected $fillable = [
        'student_id',
        'perkaderan_id',
        'tahun_ajaran',
        'semester',
        'status',
        'jabatan'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function perkaderan()
    {
        return $this->belongsTo(Perkaderan::class, 'perkaderan_id');
    }

    public function attendances()
    {
        return $this->hasMany(PerkaderanAttendance::class, 'perkaderan_student_id');
    }

    public function assessments()
    {
        return $this->hasMany(PerkaderanAssessment::class, 'perkaderan_student_id');
    }
}