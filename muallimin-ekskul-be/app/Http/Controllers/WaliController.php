<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class WaliController extends Controller
{
    public function dashboard(Request $request)
    {
        try {
            $activeYear = AcademicYear::where('is_active', true)->first();
            
            // KUNCI PERBAIKAN: Karena yang login adalah "Siswa", maka $request->user() adalah model Student.
            // Kita bisa langsung mengambil ID-nya.
            $studentId = $request->user()->id;

            // Cek apakah tabel memiliki kolom academic_year_id untuk mencegah error SQL
            $attendanceHasYear = Schema::hasColumn('attendances', 'academic_year_id');
            $assessmentHasYear = Schema::hasColumn('assessments', 'academic_year_id');

            $student = Student::with([
                'exculs' => function($q) use ($activeYear) {
                    if ($activeYear) $q->where('excul_student.academic_year_id', $activeYear->id);
                },
                'attendances' => function($q) use ($activeYear, $attendanceHasYear) {
                    if ($activeYear && $attendanceHasYear) $q->where('academic_year_id', $activeYear->id);
                },
                'assessments' => function($q) use ($activeYear, $assessmentHasYear) {
                    if ($activeYear && $assessmentHasYear) $q->where('academic_year_id', $activeYear->id);
                },
                'perkaderans' => function($q) use ($activeYear) {
                    if ($activeYear) $q->where('tahun_ajaran', $activeYear->name);
                },
                'perkaderans.perkaderan',
                'achievements'
            ])->find($studentId);

            if (!$student) {
                return response()->json([
                    'success' => false, 
                    'message' => "Data Induk Siswa tidak ditemukan di database."
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
                $total = $exculAttendances->count();
                $persentase = $total > 0 ? round(($hadir / $total) * 100) : 0;
                $assessment = $student->assessments->where('excul_id', $excul->id)->first();

                return [
                    'id' => $excul->id,
                    'name' => $excul->name,
                    'attendance_summary' => [
                        'hadir' => $hadir,
                        'total_meetings' => $total,
                        'percentage' => $persentase
                    ],
                    'assessment' => $assessment ? [
                        'score' => $assessment->score,
                        'predicate' => $assessment->predicate,
                        'description' => $assessment->description
                    ] : null
                ];
            });

            $perkaderanData = $student->perkaderans->map(function($pkStudent) {
                $pkAttendances = method_exists($pkStudent, 'attendances') ? $pkStudent->attendances : collect();
                $pkHadir = $pkAttendances->where('status', 'HADIR')->count();
                $pkTotal = $pkAttendances->count();
                $pkPersentase = $pkTotal > 0 ? round(($pkHadir / $pkTotal) * 100) : 0;

                $pkAssessment = method_exists($pkStudent, 'assessments') ? $pkStudent->assessments->first() : null;

                return [
                    'jenjang' => $pkStudent->perkaderan ? $pkStudent->perkaderan->nama_jenjang : '-',
                    'jabatan' => $pkStudent->jabatan ?: 'Peserta',
                    'status' => $pkStudent->status,
                    'attendance_summary' => ['percentage' => $pkPersentase],
                    'assessment' => $pkAssessment ? ['predicate' => $pkAssessment->predicate] : null
                ];
            });

            $achievementsData = $student->achievements->sortByDesc('tanggal')->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'profile' => $profile,
                    'exculs' => $exculsData,
                    'perkaderans' => $perkaderanData,
                    'achievements' => $achievementsData
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem (Backend): ' . $e->getMessage()
            ], 500);
        }
    }

    public function attendances(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $student = $request->user(); // Sudah langsung model Student
        
        $query = $student->attendances()->with('excul')->orderBy('date', 'desc');
        
        $attendanceHasYear = Schema::hasColumn('attendances', 'academic_year_id');
        if ($activeYear && $attendanceHasYear) {
            $query->where('academic_year_id', $activeYear->id);
        }

        $exculAttendances = $query->get();

        $pkAttendances = collect();
        $studentPks = $student->perkaderans;
        foreach ($studentPks as $pkStudent) {
             $pkAttendances = method_exists($pkStudent, 'attendances') ? $pkAttendances->merge($pkStudent->attendances()->with('perkaderan')->get()) : $pkAttendances;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'excul' => $exculAttendances,
                'perkaderan' => $pkAttendances->sortByDesc('tanggal')->values()
            ]
        ], 200);
    }

    public function assessments(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $student = $request->user(); // Sudah langsung model Student
        
        $query = $student->assessments()->with(['excul', 'mentor'])->orderBy('created_at', 'desc');
        
        $assessmentHasYear = Schema::hasColumn('assessments', 'academic_year_id');
        if ($activeYear && $assessmentHasYear) {
            $query->where('academic_year_id', $activeYear->id);
        }

        $exculAssessments = $query->get();

        $pkAssessments = collect();
        $studentPks = $student->perkaderans;
        foreach ($studentPks as $pkStudent) {
             $pkAssessments = method_exists($pkStudent, 'assessments') ? $pkAssessments->merge($pkStudent->assessments()->get()) : $pkAssessments;
        }

        return response()->json([
            'success' => true,
            'data' => [
                 'excul' => $exculAssessments,
                 'perkaderan' => $pkAssessments
            ]
        ], 200);
    }
}