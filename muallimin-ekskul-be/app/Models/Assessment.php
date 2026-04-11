<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'student_id',
        'excul_id',
        'mentor_id',
        'score',
        'predicate',
        'bloom_level',
        'description',
        'academic_year'
    ];

    // Relasi ke Siswa
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    // Relasi ke Ekskul
    public function excul()
    {
        return $this->belongsTo(Excul::class);
    }

    // Relasi ke Mentor (User)
    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    // --- INOVASI: OTOMATISASI PENILAIAN ---
    // Fungsi ini bisa dipanggil kapan saja untuk mengonversi nilai angka 
    // menjadi format Bloom yang lengkap sesuai Master Data yang kamu berikan.
    public static function calculateGradeDetails($score)
    {
        if ($score >= 92 && $score <= 100) {
            return [
                'predicate' => 'A',
                'bloom_level' => 'Naturalisasi',
                'description' => 'Santri sangat mampu menampilkan keterampilan secara mandiri, tepat, konsisten, dan percaya diri tanpa bimbingan.'
            ];
        } elseif ($score >= 83 && $score <= 91) {
            return [
                'predicate' => 'B',
                'bloom_level' => 'Artikulasi',
                'description' => 'Santri mampu menampilkan keterampilan dengan teknik yang benar dan koordinasi yang baik, meskipun sesekali masih memerlukan arahan.'
            ];
        } elseif ($score >= 77 && $score <= 82) {
            return [
                'predicate' => 'C',
                'bloom_level' => 'Presisi',
                'description' => 'Santri cukup mampu mempraktikkan keterampilan dengan ketepatan yang cukup, namun belum konsisten.'
            ];
        } elseif ($score >= 1 && $score <= 76) {
            return [
                'predicate' => 'D',
                'bloom_level' => 'Manipulasi',
                'description' => 'Santri kurang mampu mempraktikkan keterampilan secara mandiri dan masih sering memerlukan bimbingan.'
            ];
        } else {
            return [
                'predicate' => 'E',
                'bloom_level' => 'Persepsi',
                'description' => 'Santri tidak menunjukkan keaktifan serta tidak mengikuti kegiatan. Tidak ada bukti praktik, partisipasi, atau pencapaian keterampilan.'
            ];
        }
    }
}