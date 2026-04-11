<?php

namespace App\Http\Controllers;

use App\Models\Excul;
use Illuminate\Http\Request;

class ExculController extends Controller
{
    public function index()
    {
        $exculs = Excul::withCount('students')->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $exculs
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string'
        ]);

        $excul = Excul::create([
            'name' => $request->name,
            'location' => $request->location
        ]);

        return response()->json([
            'success' => true,
            'data' => $excul
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $excul = Excul::find($id);

        if (!$excul) {
            return response()->json([
                'success' => false, 
                'message' => 'Ekskul tidak ditemukan'
            ], 404);
        }

        $excul->update([
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true,
            'data' => $excul
        ], 200);
    }

    public function destroy($id)
    {
        $excul = Excul::find($id);

        if (!$excul) {
            return response()->json([
                'success' => false, 
                'message' => 'Ekskul tidak ditemukan'
            ], 404);
        }

        if ($excul->students()->count() > 0) {
            return response()->json([
                'success' => false, 
                'message' => 'Gagal menghapus. Pastikan tidak ada siswa di ekskul ini.'
            ], 400);
        }

        $excul->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ekskul berhasil dihapus'
        ], 200);
    }
}