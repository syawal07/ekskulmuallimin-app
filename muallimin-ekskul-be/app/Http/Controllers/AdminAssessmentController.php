<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assessment;
use App\Models\Excul;
use App\Models\AcademicYear;
use App\Exports\AssessmentReportExport;
use Illuminate\Support\Facades\Schema;
use Maatwebsite\Excel\Facades\Excel;

class AdminAssessmentController extends Controller
{
    public function index(Request $request)
    {
        $exculId = $request->query('excul_id');
        $kelas = $request->query('kelas'); // Menangkap filter kelas dari Frontend
        $activeYear = AcademicYear::where('is_active', true)->first();

        $query = Assessment::with(['student', 'excul', 'mentor']);

        if ($exculId) {
            $query->where('excul_id', $exculId);
        }
        
        // Pengaman: Hanya filter tahun jika kolomnya sudah dibuat di database
        if ($activeYear && Schema::hasColumn('assessments', 'academic_year_id')) {
            $query->where('academic_year_id', $activeYear->id);
        }

        // Terapkan filter kelas menggunakan relasi (whereHas)
        if ($kelas) {
            $query->whereHas('student', function($q) use ($kelas) {
                $q->where('class', $kelas);
            });
        }

        $assessments = $query->get()->sortBy(function($assessment) {
            return $assessment->student ? $assessment->student->name : 'Z';
        })->values();

        // Mengambil daftar kelas unik dari siswa yang memiliki nilai di ekskul terpilih
        $availableClasses = Assessment::where('excul_id', $exculId)
            ->whereHas('student')
            ->with('student')
            ->get()
            ->pluck('student.class')
            ->unique()
            ->filter()
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $assessments,
            'classes' => $availableClasses // Kirim daftar kelas ke frontend untuk dropdown
        ], 200);
    }

    public function export(Request $request)
    {
        $exculId = $request->query('excul_id');
        $kelas = $request->query('kelas'); // Tangkap permintaan kelas untuk diekspor
        
        if (!$exculId) {
            return response()->json(['message' => 'Pilih ekstrakurikuler terlebih dahulu'], 400);
        }

        $excul = Excul::find($exculId);
        
        // Modifikasi penamaan file agar rapi dan mencantumkan nama kelas
        $namaEkskul = $excul ? str_replace(' ', '_', $excul->name) : 'Ekskul';
        $namaKelas = $kelas ? '_' . str_replace(' ', '', $kelas) : '_Semua_Kelas';
        $fileName = 'Laporan_Nilai_' . $namaEkskul . $namaKelas . '.xlsx';

        // Mengirimkan parameter kelas ke dalam class Export
        return Excel::download(new AssessmentReportExport($exculId, $kelas), $fileName);
    }

    public function statusMonitoring(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        
        // Ambil semua ekskul beserta relasi siswanya pada tahun ajaran aktif
        $exculs = Excul::with(['students' => function($q) use ($activeYear) {
            $q->where('is_active', true);
            if ($activeYear) {
                $q->where('excul_student.academic_year_id', $activeYear->id);
            }
        }, 'mentor'])->get();

        $statusData = [];

        foreach ($exculs as $excul) {
            $totalSiswa = $excul->students->count();
            
            // Hitung berapa nilai yang sudah masuk untuk ekskul ini di tahun ajaran aktif
            $queryNilai = Assessment::where('excul_id', $excul->id);
            if ($activeYear && Schema::hasColumn('assessments', 'academic_year_id')) {
                $queryNilai->where('academic_year_id', $activeYear->id);
            }
            $totalDinilai = $queryNilai->count();

            // Tentukan status
            if ($totalDinilai == 0) {
                $status = 'Belum Dinilai';
                $color = 'danger'; // Merah
            } elseif ($totalDinilai < $totalSiswa) {
                $status = 'Belum Selesai';
                $color = 'warning'; // Kuning
            } else {
                $status = 'Selesai';
                $color = 'success'; // Hijau
            }

            $statusData[] = [
                'excul_id' => $excul->id,
                'excul_name' => $excul->name,
                'mentor_name' => $excul->mentor ? $excul->mentor->name : 'Belum Ada Mentor',
                'total_siswa' => $totalSiswa,
                'total_dinilai' => $totalDinilai,
                'status' => $status,
                'color' => $color
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $statusData
        ], 200);
    }
}