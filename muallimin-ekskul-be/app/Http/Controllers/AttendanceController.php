<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Excul;
use App\Models\Student;
use App\Models\AcademicYear;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function getDashboard(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $user = $request->user()->load(['mentoringExculs.students' => function($q) use ($activeYear) {
            if ($activeYear) {
                $q->where('excul_student.academic_year_id', $activeYear->id);
            }
        }]);
        $exculs = $user->mentoringExculs;
        
        $totalExculs = $exculs->count();
        $totalStudents = $exculs->sum(function ($excul) {
            return $excul->students->count();
        });

        $today = Carbon::today();
        $attendanceToday = Attendance::where('recorder_id', $user->id)
            ->whereBetween('date', [$today->copy()->startOfDay(), $today->copy()->endOfDay()])
            ->count();

        $exculData = $exculs->map(function ($ex) {
            return [
                'id' => $ex->id,
                'name' => $ex->name,
                'location' => $ex->location,
                'students_count' => $ex->students->count()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'mentor_name' => $user->name,
                'total_exculs' => $totalExculs,
                'total_students' => $totalStudents,
                'attendance_today' => $attendanceToday,
                'exculs' => $exculData
            ]
        ], 200);
    }

   public function getPresensiSetup(Request $request)
    {
        $user = $request->user()->load('mentoringExculs');
        $exculs = $user->mentoringExculs;
        $exculId = $request->query('excul_id') ?? $request->query('exculId');
        
        $activeYear = AcademicYear::where('is_active', true)->first();
        $selectedExculName = null;
        $students = [];
        $existingAttendance = [];
        $allStudents = []; // VARIABEL BARU UNTUK DROPDOWN

        if ($exculId) {
            $selectedExcul = $exculs->where('id', $exculId)->first();
            if ($selectedExcul) {
                $selectedExculName = $selectedExcul->name;
                
                // Santri yang sudah ada di kelas ekskul ini
                $students = Student::whereHas('exculs', function($q) use ($exculId, $activeYear) {
                        $q->where('excul_student.excul_id', $exculId);
                        if ($activeYear) {
                            $q->where('excul_student.academic_year_id', $activeYear->id);
                        }
                    })
                    ->where('is_active', true)
                    ->orderBy('name', 'asc')
                    ->get();
                
                $attendances = Attendance::where('excul_id', $exculId)
                    ->whereBetween('date', [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()])
                    ->get();
                $existingAttendance = $attendances->map(function($att) {
                    return [
                        'studentId' => $att->student_id,
                        'status' => $att->status,
                        'notes' => $att->notes,
                        'proofImageUrl' => $att->proof_image_url
                    ];
                });

                // AMBIL SEMUA DATA SISWA AKTIF UNTUK DROPDOWN PENCARIAN PELATIH
                $allStudents = Student::where('is_active', true)
                                ->select('id', 'name', 'class', 'nis')
                                ->orderBy('class', 'asc')
                                ->orderBy('name', 'asc')
                                ->get();
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'exculs' => $exculs,
                'selectedExculId' => $exculId,
                'selectedExculName' => $selectedExculName,
                'students' => $students,
                'existing_attendance' => $existingAttendance,
                'all_students' => $allStudents // KIRIM KE FRONTEND
            ]
        ], 200);
    }

public function store(Request $request)
    {
        if ($request->has('exculId')) {
            $request->merge(['excul_id' => $request->exculId]);
        }

        $request->validate([
            'date' => 'required|date',
            'excul_id' => 'required|exists:exculs,id',
            'proofImage' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120'
        ]);

        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json(['success' => false, 'message' => 'Tahun Pelajaran belum diatur'], 400);
        }

        $date = Carbon::parse($request->date)->setTime(12, 0, 0);
        $userId = $request->user()->id;
        $exculId = $request->excul_id;

        $proofImageUrl = null;

        if ($request->hasFile('proofImage')) {
            $file = $request->file('proofImage');
            $filename = 'proof-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/proofs');
            if (!file_exists($destinationPath)) mkdir($destinationPath, 0755, true);
            
            $file->move($destinationPath, $filename);
            $proofImageUrl = '/uploads/proofs/' . $filename;
        }

        DB::beginTransaction();
        try {
            $allInputs = $request->all();
            
            foreach ($allInputs as $key => $status) {
                if (str_starts_with($key, 'status-')) {
                    $studentId = str_replace('status-', '', $key);
                    $notes = $request->input("notes-{$studentId}", '');

                    $existing = Attendance::where('student_id', $studentId)
                        ->where('excul_id', $exculId)
                        ->whereBetween('date', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])
                        ->first();

                    if ($existing) {
                        $existing->update([
                            'status' => $status,
                            'notes' => $notes,
                            'recorder_id' => $userId,
                            'proof_image_url' => $proofImageUrl ?: $existing->proof_image_url
                        ]);
                    } else {
                        Attendance::create([
                            'date' => $date,
                            'status' => $status,
                            'notes' => $notes,
                            'student_id' => $studentId,
                            'recorder_id' => $userId,
                            'excul_id' => $exculId,
                            'academic_year_id' => $activeYear->id,
                            'proof_image_url' => $proofImageUrl
                        ]);
                    }
                }
            }
            
            DB::commit();
            return response()->json(['success' => true], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal menyimpan presensi: ' . $e->getMessage()], 500);
        }
    }

    public function getRecap(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'excul_id'   => 'required|exists:exculs,id'
        ]);

        $user = $request->user();
        $activeYear = AcademicYear::where('is_active', true)->first();
        
        $isMentoring = $user->mentoringExculs()->where('excul_id', $request->excul_id)->exists();
        if (!$isMentoring) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $exculId = $request->query('excul_id');

        $students = Student::whereHas('exculs', function($q) use ($exculId, $activeYear) {
                $q->where('excul_student.excul_id', $exculId);
                if ($activeYear) {
                    $q->where('excul_student.academic_year_id', $activeYear->id);
                }
            })
            ->with(['attendances' => function($q) use ($startDate, $endDate, $exculId) {
                $q->where('excul_id', $exculId)
                  ->whereBetween('date', [$startDate, $endDate]);
            }])
            ->where('is_active', true)
            ->orderBy('class')
            ->orderBy('name')
            ->get();

        $recapData = [];

        foreach ($students as $student) {
            $attendances = $student->attendances;
            $hadir = $attendances->where('status', 'HADIR')->count();
            $izin = $attendances->where('status', 'IZIN')->count();
            $sakit = $attendances->where('status', 'SAKIT')->count();
            $alpha = $attendances->where('status', 'ALPHA')->count();

            $history = $attendances->map(function($att) {
                return [
                    'date' => $att->date,
                    'status' => $att->status,
                    'notes' => $att->notes
                ];
            })->sortBy('date')->values();

            $recapData[] = [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'student_class' => $student->class,
                'summary' => [
                    'hadir' => $hadir,
                    'izin' => $izin,
                    'sakit' => $sakit,
                    'alpha' => $alpha,
                    'total_meetings' => $hadir + $izin + $sakit + $alpha
                ],
                'history' => $history
            ];
        }

        return response()->json(['success' => true, 'data' => $recapData], 200);
    }
    public function getHistory(Request $request)
    {
        $user = $request->user();
        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);

        $attendances = Attendance::with('excul')
            ->where('recorder_id', $user->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        $historyData = [];
        $groupedAttendances = $attendances->groupBy(function($item) {
            return $item->date->format('Y-m-d') . '|' . $item->excul_id;
        });

        foreach ($groupedAttendances as $key => $group) {
            $date = $group->first()->date->format('Y-m-d');
            $exculId = $group->first()->excul_id;
            $exculName = $group->first()->excul ? $group->first()->excul->name : 'Ekskul';
            
            $hadir = $group->where('status', 'HADIR')->count();
            $izin = $group->where('status', 'IZIN')->count();
            $sakit = $group->where('status', 'SAKIT')->count();
            $alpha = $group->where('status', 'ALPHA')->count();
            
            $hasProof = $group->whereNotNull('proof_image_url')->count() > 0;

            $historyData[] = [
                'date' => $date,
                'exculId' => $exculId,
                'exculName' => $exculName,
                'hasProof' => $hasProof,
                'stats' => [
                    'HADIR' => $hadir,
                    'IZIN' => $izin,
                    'SAKIT' => $sakit,
                    'ALPHA' => $alpha
                ]
            ];
        }

        usort($historyData, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return response()->json([
            'success' => true,
            'data' => $historyData
        ], 200);
    }
   public function getPresensiEdit(Request $request)
    {
        try {
            $user = $request->user()->load('mentoringExculs');
            $exculs = $user->mentoringExculs;
            
            $exculId = $request->query('excul_id') ?? $request->query('exculId');
            $dateString = $request->query('date');
            $activeYear = AcademicYear::where('is_active', true)->first();

            if (!$exculId || !$dateString) {
                return response()->json(['success' => false, 'message' => 'Parameter excul_id dan date wajib diisi'], 400);
            }

            $date = Carbon::parse($dateString);
            $selectedExculName = 'Ekskul';
            $students = [];
            $existingAttendance = [];

            $selectedExcul = $exculs->where('id', $exculId)->first();
            if ($selectedExcul) {
                $selectedExculName = $selectedExcul->name;
            } else {
                $fallbackExcul = Excul::find($exculId);
                if ($fallbackExcul) {
                    $selectedExculName = $fallbackExcul->name;
                }
            }
            
            $students = Student::whereHas('exculs', function($q) use ($exculId, $activeYear) {
                    $q->where('excul_student.excul_id', $exculId);
                    if ($activeYear) {
                        $q->where('excul_student.academic_year_id', $activeYear->id);
                    }
                })
                ->where('is_active', true)
                ->orderBy('name', 'asc')
                ->get();
            
            $attendances = Attendance::where('excul_id', $exculId)
                ->whereBetween('date', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])
                ->get();

            $existingAttendance = $attendances->map(function($att) {
                return [
                    'studentId' => $att->student_id,
                    'status' => $att->status,
                    'notes' => $att->notes,
                    'proofImageUrl' => $att->proof_image_url ?? null
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'excul_name' => $selectedExculName,
                    'students' => $students,
                    'existing_attendance' => $existingAttendance
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }
    // --- PENANDA: TAMBAHAN FUNGSI HAPUS SESI PRESENSI ---
    public function destroySession(Request $request)
    {
        $dateString = $request->query('date');
        $exculId = $request->query('excul_id') ?? $request->query('exculId');
        
        if (!$dateString || !$exculId) {
            return response()->json(['success' => false, 'message' => 'Tanggal dan ID Ekskul harus disertakan.'], 400);
        }

        try {
            $date = Carbon::parse($dateString);
            
            // Hapus semua presensi pada tanggal dan ekskul tersebut
            $deletedCount = Attendance::where('excul_id', $exculId)
                ->whereBetween('date', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])
                ->delete();

            if ($deletedCount === 0) {
                return response()->json(['success' => false, 'message' => 'Tidak ada data presensi yang ditemukan untuk dihapus.'], 404);
            }

            return response()->json([
                'success' => true, 
                'message' => "Sesi presensi ($deletedCount data) berhasil dihapus."
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Gagal menghapus sesi presensi: ' . $e->getMessage()
            ], 500);
        }
    }
}