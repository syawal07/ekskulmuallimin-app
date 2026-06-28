<?php

namespace App\Http\Controllers;

use App\Models\PerkaderanStudent;
use App\Models\Perkaderan;
use Illuminate\Http\Request;

class AdminPerkaderanMonitorController extends Controller
{
    public function index(Request $request)
    {
        // Ambil semua data siswa yang terdaftar di perkaderan, include nilai & presensinya
        $query = PerkaderanStudent::with(['student', 'perkaderan', 'assessments', 'attendances']);

        if ($request->has('perkaderan_id') && $request->perkaderan_id != '') {
            $query->where('perkaderan_id', $request->perkaderan_id);
        }

        $data = $query->get()->map(function($ps) {
            $totalPertemuan = $ps->attendances->count();
            
            // --- KUNCI PERBAIKAN ---
            // Gunakan filter dan strtolower agar kebal terhadap perbedaan huruf besar/kecil
            $hadir = $ps->attendances->filter(function($att) {
                return strtolower($att->status) === 'hadir';
            })->count();
            
            return [
                'id' => $ps->id,
                'nama_santri' => $ps->student->name ?? '-',
                'kelas' => $ps->student->class ?? '-',
                'jenjang' => $ps->perkaderan->nama_jenjang ?? '-',
                'persentase_hadir' => $totalPertemuan > 0 ? round(($hadir / $totalPertemuan) * 100, 1) : 0,
                'nilai' => $ps->assessments->first()->nilai ?? 0,
                'catatan' => $ps->assessments->first()->catatan ?? '-'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'jenjang_options' => Perkaderan::all(['id', 'nama_jenjang'])
        ], 200);
    }
}