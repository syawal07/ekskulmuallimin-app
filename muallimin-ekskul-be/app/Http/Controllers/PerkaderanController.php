<?php

namespace App\Http\Controllers;

use App\Models\Perkaderan;
use Illuminate\Http\Request;

class PerkaderanController extends Controller
{
    public function index()
    {
        $perkaderans = Perkaderan::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $perkaderans
        ], 200);
    }

    public function show($id)
    {
        $perkaderan = Perkaderan::find($id);

        if (!$perkaderan) {
            return response()->json([
                'success' => false,
                'message' => 'Jenjang perkaderan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $perkaderan
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_jenjang' => 'required|string|max:255',
            'deskripsi' => 'nullable|string'
        ]);

        $perkaderan = Perkaderan::create([
            'nama_jenjang' => $request->nama_jenjang,
            'deskripsi' => $request->deskripsi
        ]);

        return response()->json([
            'success' => true,
            'data' => $perkaderan
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_jenjang' => 'required|string|max:255',
            'deskripsi' => 'nullable|string'
        ]);

        $perkaderan = Perkaderan::find($id);

        if (!$perkaderan) {
            return response()->json([
                'success' => false,
                'message' => 'Jenjang perkaderan tidak ditemukan'
            ], 404);
        }

        $perkaderan->update([
            'nama_jenjang' => $request->nama_jenjang,
            'deskripsi' => $request->deskripsi
        ]);

        return response()->json([
            'success' => true,
            'data' => $perkaderan
        ], 200);
    }

    public function destroy($id)
    {
        $perkaderan = Perkaderan::find($id);

        if (!$perkaderan) {
            return response()->json([
                'success' => false,
                'message' => 'Jenjang perkaderan tidak ditemukan'
            ], 404);
        }

        if ($perkaderan->perkaderanStudents()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus karena jenjang ini sedang digunakan oleh siswa.'
            ], 400);
        }

        $perkaderan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jenjang perkaderan berhasil dihapus'
        ], 200);
    }
}