<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    // Mengambil semua data Tapel, diurutkan dari yang terbaru
    public function index()
    {
        $years = AcademicYear::orderBy('name', 'desc')->orderBy('semester', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $years
        ], 200);
    }

    // Mengambil Tapel yang sedang aktif saja (bisa dipakai oleh Frontend global)
    public function getActive()
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        return response()->json([
            'success' => true,
            'data' => $activeYear
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|regex:/^\d{4}\/\d{4}$/', // Validasi format: 2025/2026
            'semester' => 'required|in:Ganjil,Genap',
            'is_active' => 'boolean'
        ]);

        DB::beginTransaction();
        try {
            // Jika dikirim sebagai aktif, matikan yang lain dulu
            if ($request->is_active) {
                AcademicYear::where('is_active', true)->update(['is_active' => false]);
            }

            $year = AcademicYear::create([
                'name' => $request->name,
                'semester' => $request->semester,
                'is_active' => $request->is_active ?? false
            ]);

            DB::commit();
            return response()->json(['success' => true, 'data' => $year], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal menyimpan tahun pelajaran.'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|regex:/^\d{4}\/\d{4}$/',
            'semester' => 'required|in:Ganjil,Genap',
        ]);

        $year = AcademicYear::find($id);
        if (!$year) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        // is_active tidak diupdate di sini, gunakan endpoint setActive khusus
        $year->update([
            'name' => $request->name,
            'semester' => $request->semester,
        ]);

        return response()->json(['success' => true, 'data' => $year], 200);
    }

    // Endpoint khusus untuk tombol "Set sebagai Tapel Aktif"
    public function setActive($id)
    {
        DB::beginTransaction();
        try {
            // Nonaktifkan semua tapel
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
            
            // Aktifkan tapel yang dipilih
            $year = AcademicYear::findOrFail($id);
            $year->update(['is_active' => true]);

            DB::commit();
            return response()->json([
                'success' => true, 
                'message' => 'Tahun Pelajaran ' . $year->name . ' Semester ' . $year->semester . ' sekarang aktif.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal mengaktifkan tahun pelajaran.'], 500);
        }
    }

    public function destroy($id)
    {
        $year = AcademicYear::find($id);
        if (!$year) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        // Proteksi agar tapel yang sedang berjalan tidak bisa dihapus
        if ($year->is_active) {
            return response()->json(['success' => false, 'message' => 'Tidak dapat menghapus Tahun Pelajaran yang sedang aktif beroperasi.'], 400);
        }

        $year->delete();
        return response()->json(['success' => true, 'message' => 'Tahun Pelajaran berhasil dihapus.'], 200);
    }
}