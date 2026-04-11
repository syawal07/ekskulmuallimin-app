<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AssessmentTemplateExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $exculId;

    public function __construct($exculId)
    {
        $this->exculId = $exculId;
    }

    public function collection()
    {
        return Student::where('excul_id', $this->exculId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
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
            ''
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