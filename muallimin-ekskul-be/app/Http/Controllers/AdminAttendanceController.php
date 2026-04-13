<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
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

        // 1. Ambil semua siswa yang aktif di ekskul tersebut
        $students = \App\Models\Student::where('excul_id', $exculId)
            ->where('is_active', true)
            ->orderBy('class')
            ->orderBy('name')
            ->get();

        $recapData = [];

        foreach ($students as $student) {
            // 2. Ambil semua data presensi siswa tersebut dalam rentang tanggal
            $attendances = \App\Models\Attendance::where('student_id', $student->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->get();

            // 3. Hitung jumlah tiap status
            $hadir = $attendances->where('status', 'HADIR')->count();
            $izin = $attendances->where('status', 'IZIN')->count();
            $sakit = $attendances->where('status', 'SAKIT')->count();
            $alpha = $attendances->where('status', 'ALPHA')->count();

            // 4. Siapkan data detail history untuk modal pop-up nanti
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

        $query = \App\Models\Attendance::with(['student.excul', 'recorder'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($exculId && $exculId !== 'all') {
            $query->whereHas('student', function($q) use ($exculId) {
                $q->where('excul_id', $exculId);
            });
        }

        $attendances = $query->get();

        $sessions = [];

        foreach ($attendances as $att) {
            if (!$att->student || !$att->student->excul) continue;

            $dateStr = \Carbon\Carbon::parse($att->date)->toDateString();
            $excul = $att->student->excul;
            $key = $dateStr . '_' . $excul->id;

            if (!isset($sessions[$key])) {
                $sessions[$key] = [
                    'id' => $key,
                    'date' => $dateStr,
                    'excul_name' => $excul->name,
                    'mentor_name' => $att->recorder ? $att->recorder->name : 'Mentor',
                    'proofImageUrl' => $att->proofImageUrl,
                    'stats' => ['HADIR' => 0, 'IZIN' => 0, 'SAKIT' => 0, 'ALPHA' => 0],
                    'students' => []
                ];
            }

            if (isset($sessions[$key]['stats'][$att->status])) {
                $sessions[$key]['stats'][$att->status]++;
            }

            $sessions[$key]['students'][] = [
                'name' => $att->student->name,
                'class' => $att->student->class,
                'status' => $att->status,
                'notes' => $att->notes
            ];
        }

        usort($sessions, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return response()->json([
            'success' => true,
            'data' => array_values($sessions)
        ], 200);
    }
}