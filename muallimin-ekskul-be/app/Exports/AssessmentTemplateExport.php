<?php

namespace App\Exports;

use App\Models\Student;
use App\Models\AcademicYear;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AssessmentTemplateExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $exculId;
    protected $kelas; // Tambahkan properti kelas

    // Ubah constructor untuk menerima kelas
    public function __construct($exculId, $kelas = null)
    {
        $this->exculId = $exculId;
        $this->kelas = $kelas;
    }

    public function collection()
    {
        $activeYear = AcademicYear::where('is_active', true)->first();

        $query = Student::whereHas('exculs', function($q) use ($activeYear) {
                $q->where('excul_student.excul_id', $this->exculId);
                if ($activeYear) {
                    $q->where('excul_student.academic_year_id', $activeYear->id);
                }
            })
            ->where('is_active', true);
            
        // Terapkan filter kelas JIKA ada
        if ($this->kelas) {
            $query->where('class', $this->kelas);
        }

        return $query->orderBy('class')->orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'ID_SISWA',
            'NAMA_SISWA',
            'KELAS',
            'NILAI_ANGKA'
        ];
    }

    public function map($student): array
    {
        return [
            $student->id,
            $student->name,
            $student->class,
            '' // Kolom nilai dibiarkan kosong untuk diisi
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF0ea5e9']]
            ]
        ];
    }
}