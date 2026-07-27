<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Excul extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'location', 'kategori'];

    public function mentors()
    {
        return $this->belongsToMany(User::class, 'excul_user', 'excul_id', 'user_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'excul_student', 'excul_id', 'student_id')
                    ->withPivot('academic_year_id', 'is_active')
                    ->withTimestamps();
    }
}