<?php

namespace App\Exports;

use App\Models\Attendance;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AttendanceExport implements FromCollection, WithHeadings, WithMapping
{
    protected $date;
    protected $exculId;

    public function __construct($date, $exculId)
    {
        $this->date = $date;
        $this->exculId = $exculId;
    }

    public function collection()
    {
        return Attendance::with('student')
            ->whereHas('student', function($q) {
                $q->where('excul_id', $this->exculId);
            })
            ->whereDate('date', Carbon::parse($this->date)->toDateString())
            ->get()
            ->sortBy('student.name');
    }

    public function headings(): array
    {
        return [
            'Nama Siswa',
            'Kelas',
            'Status Kehadiran',
            'Waktu Presensi',
            'Catatan/Keterangan'
        ];
    }

    public function map($attendance): array
    {
        return [
            $attendance->student->name,
            $attendance->student->class,
            $attendance->status,
            Carbon::parse($attendance->created_at)->format('H:i:s') . ' WIB',
            $attendance->notes ?? '-'
        ];
    }
}