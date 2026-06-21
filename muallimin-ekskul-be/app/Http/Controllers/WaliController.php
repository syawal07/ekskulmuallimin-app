<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WaliController extends Controller
{
    public function dashboard(Request $request)
    {
        $student = $request->user()->load('excul');

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard berhasil diambil',
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nis' => $student->nis,
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
        $attendances = $request->user()
            ->attendances()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data presensi berhasil diambil',
            'data' => $attendances
        ], 200);
    }

    public function assessments(Request $request)
    {
        $assessments = $request->user()
            ->assessments()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data penilaian berhasil diambil',
            'data' => $assessments
        ], 200);
    }
}