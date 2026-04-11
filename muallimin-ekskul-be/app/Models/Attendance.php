<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasUuids;

    protected $fillable = [
        'date', 'status', 'notes', 'proof_image_url', 'student_id', 'recorder_id'
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    // Relasi: Presensi ini milik siswa siapa
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    // Relasi: Presensi ini dicatat oleh siapa (Admin/Mentor)
    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorder_id');
    }
}