<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;

class WaliController extends Controller
{
    public function dashboard(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $studentId = $request->user()->id;

        $student = \App\Models\Student::with([
            'exculs' => function($q) use ($activeYear) {
                if ($activeYear) {
                    $q->where('excul_student.academic_year_id', $activeYear->id);
                }
            },
            'attendances' => function($q) use ($activeYear) {
                if ($activeYear) {
                    $q->where('academic_year_id', $activeYear->id);
                }
            },
            'assessments' => function($q) use ($activeYear) {
                if ($activeYear) {
                    $q->where('academic_year_id', $activeYear->id);
                }
            },
            'perkaderans' => function($q) use ($activeYear) {
                if ($activeYear) {
                    $q->where('tahun_ajaran', $activeYear->name);
                }
            },
            'perkaderans.perkaderan',
            'perkaderans.attendances',
            'perkaderans.assessments',
            'achievements'
        ])->find($studentId);

        if (!$student) {
            return response()->json([
                'success' => false, 
                'message' => 'Data Siswa tidak ditemukan'
            ], 404);
        }

        $profile = [
            'name' => $student->name,
            'nis' => $student->nis,
            'class' => $student->class,
            'angkatan' => $student->angkatan,
            'tahun_pelajaran' => $activeYear ? $activeYear->name : '-',
            'semester' => $activeYear ? $activeYear->semester : '-'
        ];

        $exculsData = $student->exculs->map(function($excul) use ($student) {
            $exculAttendances = $student->attendances->where('excul_id', $excul->id);
            
            $hadir = $exculAttendances->where('status', 'HADIR')->count();
            $izin = $exculAttendances->where('status', 'IZIN')->count();
            $sakit = $exculAttendances->where('status', 'SAKIT')->count();
            $alpha = $exculAttendances->where('status', 'ALPHA')->count();
            $total = $hadir + $izin + $sakit + $alpha;
            
            $persentase = $total > 0 ? round(($hadir / $total) * 100) : 0;

            $assessment = $student->assessments->where('excul_id', $excul->id)->first();

            return [
                'id' => $excul->id,
                'name' => $excul->name,
                'attendance_summary' => [
                    'hadir' => $hadir,
                    'izin' => $izin,
                    'sakit' => $sakit,
                    'alpha' => $alpha,
                    'total_meetings' => $total,
                    'percentage' => $persentase . '%'
                ],
                'assessment' => $assessment ? [
                    'score' => $assessment->score,
                    'predicate' => $assessment->predicate,
                    'bloom_level' => $assessment->bloom_level,
                    'description' => $assessment->description
                ] : null
            ];
        });

        $perkaderanData = $student->perkaderans->map(function($pkStudent) {
            $pkAttendances = $pkStudent->attendances;
            $pkHadir = $pkAttendances->where('status', 'HADIR')->count();
            $pkTotal = $pkAttendances->count();
            $pkPersentase = $pkTotal > 0 ? round(($pkHadir / $pkTotal) * 100) : 0;

            $pkAssessment = $pkStudent->assessments->first();

            return [
                'jenjang' => $pkStudent->perkaderan ? $pkStudent->perkaderan->nama_jenjang : '-',
                'jabatan' => $pkStudent->jabatan ?: 'Peserta',
                'status' => $pkStudent->status,
                'attendance_percentage' => $pkPersentase . '%',
                'nilai' => $pkAssessment ? $pkAssessment->nilai : '-',
                'catatan' => $pkAssessment ? $pkAssessment->catatan : '-'
            ];
        });

        $achievementsData = $student->achievements->sortByDesc('tanggal')->values();

        return response()->json([
            'success' => true,
            'message' => 'Data aggregator dashboard berhasil diambil',
            'data' => [
                'profile' => $profile,
                'exculs' => $exculsData,
                'perkaderans' => $perkaderanData,
                'achievements' => $achievementsData
            ]
        ], 200);
    }

    public function attendances(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        
        $query = $request->user()->attendances()->with('excul')->orderBy('date', 'desc');
        
        if ($activeYear) {
            $query->where('academic_year_id', $activeYear->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Riwayat presensi detail berhasil diambil',
            'data' => $query->get()
        ], 200);
    }

    public function assessments(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        
        $query = $request->user()->assessments()->with(['excul', 'mentor'])->orderBy('created_at', 'desc');
        
        if ($activeYear) {
            $query->where('academic_year_id', $activeYear->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data penilaian detail berhasil diambil',
            'data' => $query->get()
        ], 200);
    }
}