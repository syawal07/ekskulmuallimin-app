<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Excul;
use App\Models\Perkaderan;
use App\Models\PerkaderanStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['excul', 'perkaderanStudents.perkaderan']);

        if ($request->has('q') && $request->q != '') {
            $query->where('name', 'like', '%' . $request->q . '%')
                  ->orWhere('nis', 'like', '%' . $request->q . '%');
        }

        if ($request->has('exculId') && $request->exculId != '') {
            $query->where('excul_id', $request->exculId);
        }

        if ($request->has('status_aktif') && $request->status_aktif != '') {
            $query->where('is_active', filter_var($request->status_aktif, FILTER_VALIDATE_BOOLEAN));
        }

        $students = $query->orderBy('name', 'asc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $students
        ], 200);
    }

    public function show($id)
    {
        $student = Student::with(['excul', 'perkaderanStudents.perkaderan'])->find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }

        $activePerkaderan = $student->perkaderanStudents->where('status', 'Aktif')->first();
        $student->perkaderan_id = $activePerkaderan ? $activePerkaderan->perkaderan_id : null;

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
            'excul_id' => 'required|exists:exculs,id',
            'nis' => 'nullable|string',
            'nisn' => 'nullable|string',
            'jenis_kelamin' => 'nullable|in:L,P',
            'angkatan' => 'nullable|string',
            'jabatan_organisasi' => 'nullable|string',
            'perkaderan_id' => 'nullable|exists:perkaderans,id',
            'is_active' => 'nullable|boolean',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $fotoName = null;
        if ($request->hasFile('foto')) {
            $foto = $request->file('foto');
            $fotoName = time() . '_' . $foto->getClientOriginalName();
            $foto->move(public_path('uploads/students'), $fotoName);
        }

        $student = Student::create([
            'name' => $request->name,
            'class' => $request->class,
            'nis' => $request->nis,
            'nisn' => $request->nisn,
            'jenis_kelamin' => $request->jenis_kelamin,
            'angkatan' => $request->angkatan,
            'jabatan_organisasi' => $request->jabatan_organisasi,
            'is_active' => $request->has('is_active') ? $request->is_active : true,
            'foto' => $fotoName,
            'excul_id' => $request->excul_id
        ]);

        if ($request->has('perkaderan_id') && $request->perkaderan_id != null) {
            $currentMonth = (int) date('m');
            $currentYear = (int) date('Y');
            $tahunAjaran = ($currentMonth >= 7) ? $currentYear . '/' . ($currentYear + 1) : ($currentYear - 1) . '/' . $currentYear;
            $semester = ($currentMonth >= 7) ? 'Ganjil' : 'Genap';

            PerkaderanStudent::create([
                'student_id' => $student->id,
                'perkaderan_id' => $request->perkaderan_id,
                'tahun_ajaran' => $tahunAjaran,
                'semester' => $semester,
                'status' => 'Aktif'
            ]);
        }

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
            'excul_id' => 'required|exists:exculs,id',
            'nis' => 'nullable|string',
            'nisn' => 'nullable|string',
            'jenis_kelamin' => 'nullable|in:L,P',
            'angkatan' => 'nullable|string',
            'jabatan_organisasi' => 'nullable|string',
            'perkaderan_id' => 'nullable|exists:perkaderans,id',
            'is_active' => 'nullable|boolean',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }

        $fotoName = $student->foto;
        if ($request->hasFile('foto')) {
            if ($fotoName && File::exists(public_path('uploads/students/' . $fotoName))) {
                File::delete(public_path('uploads/students/' . $fotoName));
            }
            $foto = $request->file('foto');
            $fotoName = time() . '_' . $foto->getClientOriginalName();
            $foto->move(public_path('uploads/students'), $fotoName);
        }

        $student->update([
            'name' => $request->name,
            'class' => $request->class,
            'nis' => $request->nis,
            'nisn' => $request->nisn,
            'jenis_kelamin' => $request->jenis_kelamin,
            'angkatan' => $request->angkatan,
            'jabatan_organisasi' => $request->jabatan_organisasi,
            'is_active' => $request->has('is_active') ? $request->is_active : $student->is_active,
            'foto' => $fotoName,
            'excul_id' => $request->excul_id
        ]);

        if ($request->has('perkaderan_id') && $request->perkaderan_id != null) {
            $currentMonth = (int) date('m');
            $currentYear = (int) date('Y');
            $tahunAjaran = ($currentMonth >= 7) ? $currentYear . '/' . ($currentYear + 1) : ($currentYear - 1) . '/' . $currentYear;
            $semester = ($currentMonth >= 7) ? 'Ganjil' : 'Genap';
            
            $activePerkaderan = PerkaderanStudent::where('student_id', $student->id)
                                                 ->where('status', 'Aktif')
                                                 ->first();

            if ($activePerkaderan && $activePerkaderan->perkaderan_id != $request->perkaderan_id) {
                $activePerkaderan->update(['status' => 'Lulus/Pindah']);
            }

            if (!$activePerkaderan || $activePerkaderan->perkaderan_id != $request->perkaderan_id) {
                PerkaderanStudent::create([
                    'student_id' => $student->id,
                    'perkaderan_id' => $request->perkaderan_id,
                    'tahun_ajaran' => $tahunAjaran,
                    'semester' => $semester,
                    'status' => 'Aktif'
                ]);
            }
        }

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

        if (method_exists($student, 'perkaderanStudents')) {
            $student->perkaderanStudents()->delete();
        }

        if (method_exists($student, 'attendances')) {
            $student->attendances()->delete();
        }

        if ($student->foto && File::exists(public_path('uploads/students/' . $student->foto))) {
            File::delete(public_path('uploads/students/' . $student->foto));
        }

        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data siswa dan riwayat partisipasinya berhasil dihapus'
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
        $allPerkaderans = Perkaderan::all();
        
        $currentMonth = (int) date('m');
        $currentYear = (int) date('Y');
        $tahunAjaran = ($currentMonth >= 7) ? $currentYear . '/' . ($currentYear + 1) : ($currentYear - 1) . '/' . $currentYear;
        $semester = ($currentMonth >= 7) ? 'Ganjil' : 'Genap';

        foreach ($studentsData as $data) {
            if (empty($data['name']) || empty($data['class']) || empty($data['exculName'])) {
                continue;
            }

            $exculNamesArray = array_map('trim', explode(',', $data['exculName']));
            
            $perkaderanName = isset($data['perkaderanName']) ? trim($data['perkaderanName']) : null;
            $perkaderan = $perkaderanName ? $allPerkaderans->first(function($item) use ($perkaderanName) {
                return strtolower(trim($item->nama_jenjang)) === strtolower($perkaderanName);
            }) : null;

            foreach ($exculNamesArray as $exName) {
                $excul = $allExculs->first(function($item) use ($exName) {
                    return strtolower(trim($item->name)) === strtolower($exName);
                });

                if ($excul) {
                    $student = Student::create([
                        'name' => $data['name'],
                        'class' => $data['class'],
                        'nis' => $data['nis'] ?? null,
                        'nisn' => $data['nisn'] ?? null,
                        'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
                        'angkatan' => $data['angkatan'] ?? null,
                        'jabatan_organisasi' => $data['jabatan_organisasi'] ?? null,
                        'excul_id' => $excul->id,
                        'is_active' => true
                    ]);

                    if ($perkaderan) {
                        PerkaderanStudent::create([
                            'student_id' => $student->id,
                            'perkaderan_id' => $perkaderan->id,
                            'tahun_ajaran' => $tahunAjaran,
                            'semester' => $semester,
                            'status' => 'Aktif'
                        ]);
                    }

                    $insertedCount++;
                }
            }
        }

        if ($insertedCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal import. Pastikan penulisan nama ekskul sesuai sistem.'
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