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
            
            $studentId = $request->user()->id;

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
                    $q->orderBy('updated_at', 'desc');
                },
                'perkaderans.perkaderan',
                'perkaderans.attendances',
                'perkaderans.assessments',
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
                
                $hadir = $exculAttendances->filter(function($att) {
                    return strtoupper($att->status) === 'HADIR';
                })->count();
                
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
                $pkAttendances = $pkStudent->attendances ?? collect();
                
                $pkHadir = $pkAttendances->filter(function($att) {
                    return strtoupper($att->status) === 'HADIR';
                })->count();
                
                $pkTotal = $pkAttendances->count();
                $pkPersentase = $pkTotal > 0 ? round(($pkHadir / $pkTotal) * 100) : 0;

                $pkAssessment = $pkStudent->assessments->first();
                
                $predicate = '-';
                if ($pkAssessment && $pkAssessment->nilai !== null) {
                    $nilai = $pkAssessment->nilai;
                    if ($nilai >= 90) $predicate = 'A';
                    elseif ($nilai >= 80) $predicate = 'B';
                    elseif ($nilai >= 70) $predicate = 'C';
                    else $predicate = 'D';
                }

                return [
                    'jenjang' => $pkStudent->perkaderan ? $pkStudent->perkaderan->nama_jenjang : '-',
                    'jabatan' => $pkStudent->jabatan ?: 'Peserta',
                    'status' => $pkStudent->status,
                    'attendance_summary' => ['percentage' => $pkPersentase],
                    'assessment' => $pkAssessment ? [
                        'score' => $pkAssessment->nilai,
                        'predicate' => $predicate,
                        'description' => $pkAssessment->catatan
                    ] : null
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
        $student = $request->user();
        
        $query = $student->attendances()->with('excul')->orderBy('date', 'desc');
        
        $attendanceHasYear = Schema::hasColumn('attendances', 'academic_year_id');
        if ($activeYear && $attendanceHasYear) {
            $query->where('academic_year_id', $activeYear->id);
        }

        $exculAttendances = $query->get();

        $pkAttendances = collect();
        $studentPks = $student->perkaderans()->orderBy('updated_at', 'desc')->get();
        
        foreach ($studentPks as $pkStudent) {
            if (method_exists($pkStudent, 'attendances')) {
                $pkAttendances = $pkAttendances->merge($pkStudent->attendances()->with('perkaderan')->get());
            }
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
        $student = $request->user();
        
        $query = $student->assessments()->with(['excul', 'mentor'])->orderBy('created_at', 'desc');
        
        $assessmentHasYear = Schema::hasColumn('assessments', 'academic_year_id');
        if ($activeYear && $assessmentHasYear) {
            $query->where('academic_year_id', $activeYear->id);
        }

        $exculAssessments = $query->get();

        $pkAssessments = collect();
        $studentPks = $student->perkaderans()->orderBy('updated_at', 'desc')->get();
        
        foreach ($studentPks as $pkStudent) {
            if (method_exists($pkStudent, 'assessments')) {
                $pkAssessments = $pkAssessments->merge($pkStudent->assessments()->get());
            }
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