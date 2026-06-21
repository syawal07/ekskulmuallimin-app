<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerkaderanAttendance extends Model
{
    protected $fillable = [
        'perkaderan_student_id',
        'tanggal',
        'status',
        'keterangan'
    ];

    public function perkaderanStudent()
    {
        return $this->belongsTo(PerkaderanStudent::class, 'perkaderan_student_id');
    }
}