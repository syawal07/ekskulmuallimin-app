<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index(Request $request)
    {
        $query = Achievement::with('student');

        if ($request->has('student_id') && $request->student_id != '') {
            $query->where('student_id', $request->student_id);
        }

        $achievements = $query->orderBy('tanggal', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $achievements
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'nama_lomba' => 'required|string|max:255',
            'tingkat' => 'required|string|max:100',
            'peringkat' => 'required|string|max:100',
            'tanggal' => 'required|date',
            'penyelenggara' => 'nullable|string|max:255'
        ]);

        $achievement = Achievement::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $achievement->load('student')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $achievement = Achievement::find($id);

        if (!$achievement) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'nama_lomba' => 'required|string|max:255',
            'tingkat' => 'required|string|max:100',
            'peringkat' => 'required|string|max:100',
            'tanggal' => 'required|date',
            'penyelenggara' => 'nullable|string|max:255'
        ]);

        $achievement->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $achievement->load('student')
        ], 200);
    }

    public function destroy($id)
    {
        $achievement = Achievement::find($id);

        if (!$achievement) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $achievement->delete();

        return response()->json(['success' => true, 'message' => 'Data berhasil dihapus'], 200);
    }
}