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
}