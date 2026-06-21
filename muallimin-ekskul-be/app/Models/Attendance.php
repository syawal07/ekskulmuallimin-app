<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasUuids;

    protected $fillable = [
        'date', 'status', 'notes', 'proof_image_url', 'student_id', 'recorder_id', 'excul_id', 'academic_year_id'
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorder_id');
    }

    public function excul()
    {
        return $this->belongsTo(Excul::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}