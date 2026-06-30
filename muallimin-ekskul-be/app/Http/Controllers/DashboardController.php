<?php

namespace App\Http\Controllers;

use App\Models\Excul;
use App\Models\Student;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Perkaderan;
use App\Models\PerkaderanAttendance;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function adminStats()
    {
        $totalSiswa = Student::where('is_active', true)->count();
        $totalGuru = User::whereIn('role', ['MENTOR', 'PEMBINA'])->count();
        $totalEkskul = Excul::count();
        $totalPerkaderan = Perkaderan::count();
        
        $today = Carbon::today();
        
        $presensiEkskul = Attendance::whereDate('date', '>=', $today)->count();
        $presensiPerkaderan = PerkaderanAttendance::whereDate('tanggal', '>=', $today)->count();
        
        $presensiHariIni = $presensiEkskul + $presensiPerkaderan;

        return response()->json([
            'success' => true,
            'data' => [
                'totalSiswa' => $totalSiswa,
                'totalGuru' => $totalGuru,
                'totalEkskul' => $totalEkskul + $totalPerkaderan, 
                'presensiHariIni' => $presensiHariIni
            ]
        ], 200);
    }
}