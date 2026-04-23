<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Excul;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with('excul')->where('is_active', true);

        if ($request->has('q') && $request->q != '') {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        if ($request->has('exculId') && $request->exculId != '') {
            $query->where('excul_id', $request->exculId);
        }

        $students = $query->orderBy('name', 'asc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $students
        ], 200);
    }

    public function show($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $student
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class' => 'required|string|max:50',
            'excul_id' => 'required|exists:exculs,id'
        ]);

        $student = Student::create([
            'name' => $request->name,
            'class' => $request->class,
            'nis' => $request->nis,
            'excul_id' => $request->excul_id,
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'data' => $student
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class' => 'required|string|max:50',
            'excul_id' => 'required|exists:exculs,id'
        ]);

        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }

        $student->update([
            'name' => $request->name,
            'class' => $request->class,
            'nis' => $request->nis,
            'excul_id' => $request->excul_id
        ]);

        return response()->json([
            'success' => true,
            'data' => $student
        ], 200);
    }

    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }

        if ($student->attendances()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus karena siswa ini sudah memiliki data presensi.'
            ], 400);
        }

        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil dihapus'
        ], 200);
    }

    public function import(Request $request)
    {
        $request->validate([
            'students' => 'required|array'
        ]);

        $studentsData = $request->students;
        $insertedCount = 0;

        $allExculs = Excul::all();

        foreach ($studentsData as $data) {
            if (empty($data['name']) || empty($data['class']) || empty($data['exculName'])) {
                continue;
            }

            $exculNameFromExcel = trim($data['exculName']);
            
            $excul = $allExculs->first(function($item) use ($exculNameFromExcel) {
                return strtolower(trim($item->name)) === strtolower($exculNameFromExcel);
            });

            if ($excul) {
                Student::create([
                    'name' => $data['name'],
                    'class' => $data['class'],
                    'nis' => $data['nis'] ?? null,
                    'excul_id' => $excul->id,
                    'is_active' => true
                ]);
                $insertedCount++;
            }
        }

        if ($insertedCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal import. Pastikan Nama Ekskul di Excel sama persis dengan yang ada di sistem.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil import siswa',
            'data' => [
                'count' => $insertedCount
            ]
        ], 201);
    }

    public function storeByMentor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class' => 'required|string|max:50',
            'excul_id' => 'required|exists:exculs,id'
        ]);

        $student = Student::create([
            'name' => $request->name,
            'class' => $request->class,
            'nis' => $request->nis,
            'excul_id' => $request->excul_id,
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'data' => $student
        ], 201);
    }
}