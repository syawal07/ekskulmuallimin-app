<?php

namespace App\Imports;

use App\Models\Assessment;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class AssessmentImport implements ToCollection, WithHeadingRow
{
    // Variabel untuk menyimpan statistik laporan
    public $inserted = 0;
    public $updated = 0;
    public $failed = 0;
    
    protected $exculId;
    protected $mentorId;
    protected $academicYear;

    public function __construct($exculId, $mentorId, $academicYear)
    {
        $this->exculId = $exculId;
        $this->mentorId = $mentorId;
        $this->academicYear = $academicYear;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Cek jika baris kosong, tidak ada ID, atau nilai dibiarkan kosong
            if (!isset($row['id_siswa']) || !isset($row['nilai_angka']) || $row['nilai_angka'] === '') {
                $this->failed++;
                continue;
            }

            $score = (int) $row['nilai_angka'];

            if ($score < 0 || $score > 100) {
                $this->failed++;
                continue;
            }

            $details = Assessment::calculateGradeDetails($score);

            // Simpan atau Perbarui
            $assessment = Assessment::updateOrCreate(
                [
                    'student_id' => $row['id_siswa'],
                    'excul_id' => $this->exculId,
                    'academic_year' => $this->academicYear,
                ],
                [
                    'mentor_id' => $this->mentorId,
                    'score' => $score,
                    'predicate' => $details['predicate'],
                    'bloom_level' => $details['bloom_level'],
                    'description' => $details['description'],
                ]
            );

            // Hitung apakah ini data baru atau update data lama
            if ($assessment->wasRecentlyCreated) {
                $this->inserted++;
            } else {
                $this->updated++;
            }
        }
    }
}