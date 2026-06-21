<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WaliController extends Controller
{
    public function dashboard(Request $request)
    {
        $student = $request->user();

        // Mencegah crash jika token tidak valid atau user null
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid atau tidak terautentikasi'
            ], 401);
        }

        $student->load('excul');

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard berhasil diambil',
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nis' => $student->nis,
                    'nisn' => $student->nisn,
                    'angkatan' => $student->angkatan,
                    'foto' => $student->foto,
                    'class' => $student->class,
                    'is_active' => $student->is_active,
                ],
                'excul' => $student->excul ? [
                    'id' => $student->excul->id,
                    'name' => $student->excul->name,
                ] : null,
            ]
        ], 200);
    }

    public function attendances(Request $request)
    {
        // KOSONGKAN DULU UNTUK FASE 4: Mencegah crash "undefined method attendances()"
        return response()->json([
            'success' => true,
            'message' => 'Data presensi berhasil diambil',
            'data' => [] 
        ], 200);
    }

    public function assessments(Request $request)
    {
        // KOSONGKAN DULU UNTUK FASE 4: Mencegah crash "undefined method assessments()"
        return response()->json([
            'success' => true,
            'message' => 'Data penilaian berhasil diambil',
            'data' => []
        ], 200);
    }
}