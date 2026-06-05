<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exports\AttendanceExport;
use Maatwebsite\Excel\Facades\Excel;

class AdminAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date');
        $exculId = $request->query('excul_id');
        $perPage = 15;

        if (!$date || !$exculId) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal dan Ekskul wajib diisi'
            ], 400);
        }

        $attendances = Attendance::select('attendances.*')
            ->join('students', 'attendances.student_id', '=', 'students.id')
            ->with('student')
            ->where('students.excul_id', $exculId)
            ->whereDate('attendances.date', Carbon::parse($date)->toDateString())
            ->orderBy('students.name', 'asc')
            ->paginate($perPage);

        $formattedData = $attendances->map(function ($att) {
            return [
                'id' => $att->id,
                'status' => $att->status,
                'notes' => $att->notes,
                'proofImageUrl' => $att->proofImageUrl,
                'created_at' => $att->created_at,
                'student' => [
                    'name' => $att->student->name,
                    'class' => $att->student->class,
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedData,
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'total' => $attendances->total()
            ]
        ], 200);
    }

    public function export(Request $request)
    {
        $date = $request->query('date');
        $exculId = $request->query('excul_id');

        if (!$date || !$exculId) {
            return response()->json(['message' => 'Tanggal dan Ekskul wajib diisi'], 400);
        }

        $fileName = 'Rekap_Presensi_' . Carbon::parse($date)->format('d-m-Y') . '.xlsx';
        
        return Excel::download(new AttendanceExport($date, $exculId), $fileName);
    }

    public function getMonthlyRecap(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'excul_id'   => 'required|exists:exculs,id'
        ]);

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $exculId = $request->query('excul_id');

        $students = Student::where('excul_id', $exculId)
            ->where('is_active', true)
            ->orderBy('class')
            ->orderBy('name')
            ->get();

        $recapData = [];

        foreach ($students as $student) {
            $attendances = Attendance::where('student_id', $student->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->get();

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
            'message' => 'Data rekap berhasil diambil',
            'data' => $recapData
        ], 200);
    }

    public function getSessions(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $exculId = $request->query('excul_id');
        $perPage = 10; 

        $query = Attendance::query()
            ->join('students', 'attendances.student_id', '=', 'students.id')
            ->join('exculs', 'students.excul_id', '=', 'exculs.id')
            ->leftJoin('users as recorders', 'attendances.recorded_by', '=', 'recorders.id')
            ->whereBetween('attendances.date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(attendances.date) as session_date'),
                'exculs.id as excul_id',
                'exculs.name as excul_name',
                DB::raw('MAX(recorders.name) as mentor_name'),
                DB::raw('MAX(attendances.proofImageUrl) as proofImageUrl')
            )
            ->groupBy('session_date', 'exculs.id', 'exculs.name');

        if ($exculId && $exculId !== 'all') {
            $query->where('students.excul_id', $exculId);
        }

        $query->orderBy('session_date', 'desc')->orderBy('excul_name', 'asc');

        $paginatedSessions = $query->paginate($perPage);

        $sessionsData = [];

        foreach ($paginatedSessions as $sessionGroup) {
            $dateStr = $sessionGroup->session_date;
            $currentExculId = $sessionGroup->excul_id;
            $key = $dateStr . '_' . $currentExculId;

            $studentAttendances = Attendance::with('student')
                ->whereDate('date', $dateStr)
                ->whereHas('student', function ($q) use ($currentExculId) {
                    $q->where('excul_id', $currentExculId);
                })
                ->get();

            $stats = ['HADIR' => 0, 'IZIN' => 0, 'SAKIT' => 0, 'ALPHA' => 0];
            $studentsData = [];

            foreach ($studentAttendances as $att) {
                if (isset($stats[$att->status])) {
                    $stats[$att->status]++;
                }
                $studentsData[] = [
                    'name' => $att->student->name,
                    'class' => $att->student->class,
                    'status' => $att->status,
                    'notes' => $att->notes
                ];
            }

            $sessionsData[] = [
                'id' => $key,
                'date' => $dateStr,
                'excul_name' => $sessionGroup->excul_name,
                'mentor_name' => $sessionGroup->mentor_name ?: 'Mentor',
                'proofImageUrl' => $sessionGroup->proofImageUrl,
                'stats' => $stats,
                'students' => $studentsData
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $sessionsData,
            'meta' => [
                'current_page' => $paginatedSessions->currentPage(),
                'last_page' => $paginatedSessions->lastPage(),
                'total' => $paginatedSessions->total()
            ]
        ], 200);
    }
}