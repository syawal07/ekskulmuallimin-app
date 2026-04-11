<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Excul extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'location'];

    // Relasi: Ekskul diampu oleh guru siapa saja
    public function mentors()
    {
        return $this->belongsToMany(User::class, 'excul_user', 'excul_id', 'user_id');
    }

    // Relasi: Siswa di ekskul ini
    public function students()
    {
        return $this->hasMany(Student::class);
    }
}