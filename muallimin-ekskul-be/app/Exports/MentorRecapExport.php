<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class MentorRecapExport implements FromCollection, WithMapping, WithEvents, WithCustomStartCell
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = Carbon::parse($startDate)->startOfDay();
        $this->endDate = Carbon::parse($endDate)->endOfDay();
    }

    public function collection()
    {
        $rawData = DB::table('attendances')
            ->join('users', 'attendances.recorder_id', '=', 'users.id')
            ->join('exculs', 'attendances.excul_id', '=', 'exculs.id')
            ->whereBetween('attendances.date', [$this->startDate, $this->endDate])
            ->select(
                'users.id as id_mentor',
                'users.name as nama_pelatih',
                'exculs.name as nama_ekskul',
                DB::raw('DATE(attendances.date) as tanggal')
            )
            ->distinct()
            ->orderBy('users.name')
            ->orderBy('tanggal')
            ->get();

        $rekap = [];
        $groupedData = $rawData->groupBy(function ($item) {
            return $item->id_mentor . '_' . $item->nama_ekskul;
        });

        foreach ($groupedData as $group) {
            $first = $group->first();
            $dates = $group->pluck('tanggal')->map(function($date) {
                return Carbon::parse($date)->format('d/m/Y');
            })->toArray();

            $rekap[] = (object) [
                'nama_pelatih' => $first->nama_pelatih,
                'nama_ekskul' => $first->nama_ekskul,
                'total_hadir' => count($dates),
                'tanggal_mengajar' => implode(', ', $dates)
            ];
        }

        return collect($rekap);
    }

    public function startCell(): string
    {
        return 'A4';
    }

    public function map($row): array
    {
        static $no = 0;
        $no++;
        return [
            $no,
            $row->nama_pelatih,
            $row->nama_ekskul,
            $row->total_hadir . ' Hari',
            $row->tanggal_mengajar
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $sheet->mergeCells('A1:E1');
                $sheet->mergeCells('A2:E2');
                
                $sheet->setCellValue('A1', 'REKAPITULASI KEHADIRAN PELATIH EKSTRAKURIKULER');
                $sheet->setCellValue('A2', 'PERIODE: ' . $this->startDate->format('d/m/Y') . ' - ' . $this->endDate->format('d/m/Y'));
                
                $sheet->setCellValue('A4', 'NO');
                $sheet->setCellValue('B4', 'NAMA PELATIH');
                $sheet->setCellValue('C4', 'MENGAMPU EKSKUL');
                $sheet->setCellValue('D4', 'TOTAL KEHADIRAN');
                $sheet->setCellValue('E4', 'RINCIAN TANGGAL MENGAJAR');

                $sheet->getStyle('A1:E2')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                $sheet->getStyle('A4:E4')->applyFromArray([
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE2E8F0']]
                ]);

                $sheet->getColumnDimension('A')->setWidth(5);
                $sheet->getColumnDimension('B')->setWidth(35);
                $sheet->getColumnDimension('C')->setWidth(30);
                $sheet->getColumnDimension('D')->setWidth(20);
                $sheet->getColumnDimension('E')->setWidth(50);

                $sheet->getStyle('D5:D1000')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('E')->getAlignment()->setWrapText(true);
            }
        ];
    }
}