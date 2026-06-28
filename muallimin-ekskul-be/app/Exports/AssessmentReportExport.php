<?php

namespace App\Exports;

use App\Models\Assessment;
use App\Models\Excul;
use App\Models\AcademicYear;
use Illuminate\Support\Facades\Schema;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AssessmentReportExport implements FromCollection, WithMapping, WithEvents, WithCustomStartCell
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
        
        // Relasi ke 'student' wajib ada untuk memfilter kelasnya
        $query = Assessment::with(['student'])->where('excul_id', $this->exculId);

        if ($activeYear && Schema::hasColumn('assessments', 'academic_year_id')) {
            $query->where('academic_year_id', $activeYear->id);
        }

        // Terapkan filter kelas JIKA $kelas dikirim dari Controller
        if ($this->kelas) {
            $query->whereHas('student', function($q) {
                $q->where('class', $this->kelas);
            });
        }

        // Urutkan berdasarkan kelas dulu, lalu nama agar rapi
        return $query->get()->sortBy([
            ['student.class', 'asc'],
            ['student.name', 'asc']
        ]);
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function map($assessment): array
    {
        static $rowNumber = 0;
        $rowNumber++;
        
        return [
            $rowNumber,
            $assessment->student ? $assessment->student->name : '-',
            $assessment->student ? $assessment->student->class : '-',
            $assessment->score,
            $assessment->predicate,
            $assessment->description
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $excul = Excul::find($this->exculId);
                $exculName = $excul ? strtoupper($excul->name) : 'EKSTRAKURIKULER';
                
                $activeYear = AcademicYear::where('is_active', true)->first();
                $tahunAjaran = $activeYear ? $activeYear->name : date('Y');
                
                // Tambahkan keterangan kelas di kop surat jika difilter
                $infoKelas = $this->kelas ? " - KELAS: " . strtoupper($this->kelas) : " - SEMUA KELAS";

                $sheet->mergeCells('A1:F1');
                $sheet->mergeCells('A2:F2');
                $sheet->mergeCells('A3:F3');
                
                $sheet->setCellValue('A1', 'DAFTAR NILAI PESERTA EKSTRAKURIKULER');
                $sheet->setCellValue('A2', "MADRASAH MU'ALLIMIN MUHAMMADIYAH YOGYAKARTA");
                $sheet->setCellValue('A3', "TAHUN AJARAN $tahunAjaran - CABANG: $exculName" . $infoKelas);

                $sheet->setCellValue('A4', 'NO');
                $sheet->setCellValue('B4', 'NAMA / MATERI');
                $sheet->setCellValue('C4', 'KELAS');
                $sheet->setCellValue('D4', 'NILAI ANGKA');
                $sheet->setCellValue('E4', 'PREDIKAT');
                $sheet->setCellValue('F4', 'DESKRIPSI');

                $sheet->getStyle('A1:F3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID, 
                        'startColor' => ['argb' => 'FF6495ED']
                    ]
                ]);

                $sheet->getStyle('A4:F4')->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                $sheet->getColumnDimension('A')->setWidth(5);
                $sheet->getColumnDimension('B')->setWidth(35);
                $sheet->getColumnDimension('C')->setWidth(15);
                $sheet->getColumnDimension('D')->setWidth(15);
                $sheet->getColumnDimension('E')->setWidth(12);
                $sheet->getColumnDimension('F')->setWidth(80);
                
                $sheet->getStyle('D5:E1000')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                
                $sheet->getStyle('F')->getAlignment()->setWrapText(true);
            }
        ];
    }
}