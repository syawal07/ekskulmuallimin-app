<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Excul;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function getDashboard(Request $request)
    {
        $user = $request->user()->load('mentoringExculs.students');
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
        $exculId = $request->query('excul_id');

        $selectedExculName = null;
        $students = [];
        $existingAttendance = [];

        if ($exculId) {
            $selectedExcul = $exculs->where('id', $exculId)->first();
            if ($selectedExcul) {
                $selectedExculName = $selectedExcul->name;
                $students = Student::where('excul_id', $exculId)
                    ->where('is_active', true)
                    ->orderBy('name', 'asc')
                    ->get();
                
                $attendances = Attendance::whereHas('student', function($q) use ($exculId) {
                        $q->where('excul_id', $exculId);
                    })
                    ->whereBetween('date', [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()])
                    ->get();

                $existingAttendance = $attendances->map(function($att) {
                    return [
                        'studentId' => $att->student_id,
                        'status' => $att->status,
                        'notes' => $att->notes,
                        'proofImageUrl' => $att->proofImageUrl
                    ];
                });
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'exculs' => $exculs,
                'selectedExculId' => $exculId,
                'selectedExculName' => $selectedExculName,
                'students' => $students,
                'existing_attendance' => $existingAttendance
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'proofImage' => 'nullable|image|max:2048'
        ]);

        $date = Carbon::parse($request->date)->setTime(12, 0, 0);
        $userId = $request->user()->id;

        $proofImageUrl = null;
        if ($request->hasFile('proofImage')) {
            $file = $request->file('proofImage');
            $filename = 'proof-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/proofs');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
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
                        ->whereBetween('date', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])
                        ->first();

                    if ($existing) {
                        $existing->update([
                            'status' => $status,
                            'notes' => $notes,
                            'recorder_id' => $userId,
                            'proofImageUrl' => $proofImageUrl ?: $existing->proofImageUrl
                        ]);
                    } else {
                        Attendance::create([
                            'date' => $date,
                            'status' => $status,
                            'notes' => $notes,
                            'student_id' => $studentId,
                            'recorder_id' => $userId,
                            'proofImageUrl' => $proofImageUrl
                        ]);
                    }
                }
            }
            
            DB::commit();
            return response()->json(['success' => true], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false, 
                'message' => 'Gagal menyimpan data presensi.'
            ], 500);
        }
    }

    public function getHistory(Request $request)
    {
        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);
        $userId = $request->user()->id;

        $attendances = Attendance::with('student.excul')
            ->where('recorder_id', $userId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'desc')
            ->get();

        $sessions = [];

        foreach ($attendances as $att) {
            $dateStr = Carbon::parse($att->date)->toDateString();
            $excul = $att->student->excul;
            
            if (!$excul) continue;

            $key = $dateStr . '-' . $excul->id;

            if (!isset($sessions[$key])) {
                $sessions[$key] = [
                    'date' => $dateStr,
                    'exculId' => $excul->id,
                    'exculName' => $excul->name,
                    'hasProof' => false,
                    'stats' => [
                        'HADIR' => 0, 
                        'SAKIT' => 0, 
                        'IZIN' => 0, 
                        'ALPHA' => 0
                    ]
                ];
            }

            if ($att->proofImageUrl) {
                $sessions[$key]['hasProof'] = true;
            }

            if (isset($sessions[$key]['stats'][$att->status])) {
                $sessions[$key]['stats'][$att->status]++;
            }
        }

        return response()->json([
            'success' => true, 
            'data' => array_values($sessions)
        ], 200);
    }

    public function getPresensiEdit(Request $request)
    {
        $date = $request->query('date');
        $exculId = $request->query('excul_id');

        $excul = Excul::find($exculId);
        if (!$excul) {
            return response()->json([
                'success' => false, 
                'message' => 'Ekskul tidak ditemukan'
            ], 404);
        }

        $students = Student::where('excul_id', $exculId)
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        $attendances = Attendance::whereHas('student', function($q) use ($exculId) {
                $q->where('excul_id', $exculId);
            })
            ->whereBetween('date', [Carbon::parse($date)->startOfDay(), Carbon::parse($date)->endOfDay()])
            ->get();

        $existing = $attendances->map(function($att) {
            return [
                'studentId' => $att->student_id,
                'status' => $att->status,
                'notes' => $att->notes,
                'proofImageUrl' => $att->proofImageUrl
            ];
        });

        return response()->json([
            'success' => true, 
            'data' => [
                'excul_name' => $excul->name,
                'students' => $students,
                'existing_attendance' => $existing
            ]
        ], 200);
    }

    public function destroySession(Request $request)
    {
        $date = $request->query('date');
        $exculId = $request->query('excul_id');
        $userId = $request->user()->id;

        Attendance::whereHas('student', function($q) use ($exculId) {
                $q->where('excul_id', $exculId);
            })
            ->where('recorder_id', $userId)
            ->whereBetween('date', [Carbon::parse($date)->startOfDay(), Carbon::parse($date)->endOfDay()])
            ->delete();

        return response()->json(['success' => true], 200);
    }

    public function getRecap(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'excul_id'   => 'required|exists:exculs,id'
        ]);

        $user = $request->user();
        
        $isMentoring = $user->mentoringExculs()->where('excul_id', $request->excul_id)->exists();
        if (!$isMentoring) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke data ekstrakurikuler ini.'
            ], 403);
        }

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $exculId = $request->query('excul_id');

        $students = Student::with(['attendances' => function($q) use ($startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate]);
            }])
            ->where('excul_id', $exculId)
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

        return response()->json([
            'success' => true,
            'data' => $recapData
        ], 200);
    }
}