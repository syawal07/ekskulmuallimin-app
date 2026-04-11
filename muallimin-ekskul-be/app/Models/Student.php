<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'nis', 'class', 'is_active', 'excul_id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relasi: Siswa ini ikut ekskul apa
    public function excul()
    {
        return $this->belongsTo(Excul::class);
    }

    // Relasi: Riwayat presensi siswa
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}