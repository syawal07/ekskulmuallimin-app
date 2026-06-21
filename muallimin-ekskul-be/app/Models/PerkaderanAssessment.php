<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerkaderanAssessment extends Model
{
    protected $fillable = [
        'perkaderan_student_id',
        'nilai',
        'catatan'
    ];

    public function perkaderanStudent()
    {
        return $this->belongsTo(PerkaderanStudent::class, 'perkaderan_student_id');
    }
}