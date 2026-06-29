<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perkaderan extends Model
{
    protected $fillable = [
        'nama_jenjang',
        'kategori',
        'target_kelas',
        'deskripsi'
    ];

    public function perkaderanStudents()
    {
        return $this->hasMany(PerkaderanStudent::class, 'perkaderan_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'perkaderan_user', 'perkaderan_id', 'user_id');
    }
}