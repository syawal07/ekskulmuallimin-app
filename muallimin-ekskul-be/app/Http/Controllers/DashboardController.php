<?php

namespace App\Http\Controllers;

use App\Models\Excul;
use App\Models\Student;
use App\Models\User;
use App\Models\Attendance;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function adminStats()
    {
        $totalSiswa = Student::where('is_active', true)->count();
        $totalGuru = User::where('role', 'MENTOR')->count();
        $totalEkskul = Excul::count();
        
        $today = Carbon::today();
        $presensiHariIni = Attendance::whereDate('date', '>=', $today)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'totalSiswa' => $totalSiswa,
                'totalGuru' => $totalGuru,
                'totalEkskul' => $totalEkskul,
                'presensiHariIni' => $presensiHariIni
            ]
        ], 200);
    }
}