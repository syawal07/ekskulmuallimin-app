<?php

namespace App\Exports;

use App\Models\Assessment;
use App\Models\Excul;
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

    public function __construct($exculId)
    {
        $this->exculId = $exculId;
    }

    public function collection()
    {
        return Assessment::with(['student'])
            ->where('excul_id', $this->exculId)
            ->get()
            ->sortBy('student.name');
    }

    // Mulai data dari baris ke-5
    public function startCell(): string
    {
        return 'A5';
    }

    // MEMISAHKAN DATA KE DALAM 6 KOLOM
    public function map($assessment): array
    {
        static $rowNumber = 0;
        $rowNumber++;
        
        return [
            $rowNumber,
            $assessment->student->name,
            $assessment->student->class,
            $assessment->score,       // Kolom D: Nilai Angka
            $assessment->predicate,   // Kolom E: Predikat Huruf
            $assessment->description  // Kolom F: Deskripsi
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $excul = Excul::find($this->exculId);
                $exculName = $excul ? strtoupper($excul->name) : 'EKSTRAKURIKULER';

                // Merge Cells untuk Judul diperlebar sampai kolom F
                $sheet->mergeCells('A1:F1');
                $sheet->mergeCells('A2:F2');
                $sheet->mergeCells('A3:F3');
                
                $sheet->setCellValue('A1', 'DAFTAR NILAI PESERTA EKSTRAKURIKULER');
                $sheet->setCellValue('A2', "MADRASAH MU'ALLIMIN MUHAMMADIYAH YOGYAKARTA");
                $sheet->setCellValue('A3', "TAHUN AJARAN 2025/2026 - CABANG: $exculName");

                // Header Kolom Tabel yang Baru
                $sheet->setCellValue('A4', 'NO');
                $sheet->setCellValue('B4', 'NAMA / MATERI');
                $sheet->setCellValue('C4', 'KELAS');
                $sheet->setCellValue('D4', 'NILAI ANGKA');
                $sheet->setCellValue('E4', 'PREDIKAT');
                $sheet->setCellValue('F4', 'DESKRIPSI');

                // Styling Judul Biru
                $sheet->getStyle('A1:F3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID, 
                        'startColor' => ['argb' => 'FF6495ED'] // Warna Biru Cornflower
                    ]
                ]);

                // Styling Header Tabel (Baris 4)
                $sheet->getStyle('A4:F4')->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Mengatur Lebar Kolom Masing-masing
                $sheet->getColumnDimension('A')->setWidth(5);
                $sheet->getColumnDimension('B')->setWidth(35);
                $sheet->getColumnDimension('C')->setWidth(15);
                $sheet->getColumnDimension('D')->setWidth(15); // Lebar Nilai Angka
                $sheet->getColumnDimension('E')->setWidth(12); // Lebar Predikat
                $sheet->getColumnDimension('F')->setWidth(80); // Lebar Deskripsi
                
                // Menempatkan Nilai Angka dan Predikat di tengah sel (Center)
                $sheet->getStyle('D5:E1000')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                
                // Auto text-wrap untuk kolom deskripsi
                $sheet->getStyle('F')->getAlignment()->setWrapText(true);
            }
        ];
    }
}