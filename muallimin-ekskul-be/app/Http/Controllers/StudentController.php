<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Excul;
use App\Models\Perkaderan;
use App\Models\PerkaderanStudent;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
   public function index(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        
        $query = Student::with(['exculs' => function($q) use ($activeYear) {
            if ($activeYear) {
                $q->where('excul_student.academic_year_id', $activeYear->id);
            }
        }, 'perkaderans.perkaderan']);

        if ($request->has('q') && $request->q != '') {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->q . '%')
                  ->orWhere('nis', 'like', '%' . $request->q . '%');
            });
        }

        if ($request->has('exculId') && $request->exculId != '') {
            $query->whereHas('exculs', function ($q) use ($request, $activeYear) {
                $q->where('exculs.id', $request->exculId);
                if ($activeYear) {
                    $q->where('excul_student.academic_year_id', $activeYear->id);
                }
            });
        }

        if ($request->has('kelas') && $request->kelas != '') {
            $query->where('class', $request->kelas);
        }

        if ($request->has('status_aktif') && $request->status_aktif != '') {
            $query->where('is_active', filter_var($request->status_aktif, FILTER_VALIDATE_BOOLEAN));
        }
        $limit = (int) $request->query('limit', 10);
        $allowedLimits = [10, 25, 50, 100];
        
        if (!in_array($limit, $allowedLimits)) {
            $limit = 10;
        }

        $students = $query->orderBy('name', 'asc')->paginate($limit);

        $availableClasses = Student::select('class')
            ->distinct()
            ->whereNotNull('class')
            ->orderBy('class')
            ->pluck('class');

        return response()->json([
            'success' => true,
            'data' => $students,
            'classes' => $availableClasses
        ], 200);
    }
    public function show($id)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();

        $student = Student::with(['exculs' => function($q) use ($activeYear) {
            if ($activeYear) {
                $q->where('excul_student.academic_year_id', $activeYear->id);
            }
        }, 'perkaderans' => function($q) use ($activeYear) {
            if ($activeYear) {
                $q->where('tahun_ajaran', $activeYear->name);
            }
        }, 'perkaderans.perkaderan'])->find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }

        $activePerkaderans = $student->perkaderans->where('status', 'Aktif');
        $student->perkaderan_ids = $activePerkaderans->pluck('perkaderan_id')->toArray();
        $student->jabatan_perkaderan = $activePerkaderans->first() ? $activePerkaderans->first()->jabatan : null;

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
            'excul_id' => 'required|array',
            'excul_id.*' => 'exists:exculs,id',
            'nis' => 'nullable|string',
            'nisn' => 'nullable|string',
            'jenis_kelamin' => 'nullable|in:L,P',
            'angkatan' => 'nullable|string',
            'jabatan_organisasi' => 'nullable|string',
            'perkaderan_ids' => 'nullable|array',
            'perkaderan_ids.*' => 'exists:perkaderans,id',
            'jabatan_perkaderan' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['success' => false, 'message' => 'Tahun Pelajaran Aktif belum diatur oleh sistem.'], 400);
        }

        DB::beginTransaction();
        try {
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
            ]);

            $syncData = [];
            foreach ($request->excul_id as $exculId) {
                $syncData[$exculId] = ['academic_year_id' => $activeYear->id, 'is_active' => true];
            }
            $student->exculs()->attach($syncData);

            if ($request->has('perkaderan_ids') && is_array($request->perkaderan_ids) && count($request->perkaderan_ids) > 0) {
                $pkData = [];
                foreach ($request->perkaderan_ids as $pkId) {
                    $pkData[] = [
                        'student_id' => $student->id,
                        'perkaderan_id' => $pkId,
                        'tahun_ajaran' => $activeYear->name,
                        'semester' => $activeYear->semester,
                        'status' => 'Aktif',
                        'jabatan' => $request->jabatan_perkaderan ?? 'Peserta',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                PerkaderanStudent::insert($pkData);
            }

            DB::commit();
            return response()->json(['success' => true, 'data' => $student], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan sistem.'], 500);
        }
    }

public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class' => 'required|string|max:50',
            'excul_id' => 'required|array',
            'excul_id.*' => 'exists:exculs,id',
            'nis' => 'nullable|string',
            'nisn' => 'nullable|string',
            'jenis_kelamin' => 'nullable|in:L,P',
            'angkatan' => 'nullable|string',
            'jabatan_organisasi' => 'nullable|string',
            'perkaderan_ids' => 'nullable|array',
            'perkaderan_ids.*' => 'exists:perkaderans,id',
            'jabatan_perkaderan' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $student = Student::find($id);

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan'], 404);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['success' => false, 'message' => 'Tahun Pelajaran Aktif belum diatur.'], 400);
        }

        DB::beginTransaction();
        try {
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
                'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : $student->is_active,
                'foto' => $fotoName,
            ]);

            $student->exculs()->wherePivot('academic_year_id', $activeYear->id)->detach();
            $syncData = [];
            foreach ($request->excul_id as $exculId) {
                $syncData[$exculId] = ['academic_year_id' => $activeYear->id, 'is_active' => true];
            }
            $student->exculs()->attach($syncData);

            if ($request->has('perkaderan_ids') && is_array($request->perkaderan_ids)) {
                PerkaderanStudent::where('student_id', $student->id)
                    ->where('tahun_ajaran', $activeYear->name)
                    ->whereNotIn('perkaderan_id', $request->perkaderan_ids)
                    ->delete();

                foreach ($request->perkaderan_ids as $pkId) {
                    PerkaderanStudent::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'perkaderan_id' => $pkId,
                            'tahun_ajaran' => $activeYear->name,
                        ],
                        [
                            'semester' => $activeYear->semester,
                            'status' => 'Aktif',
                            'jabatan' => $request->jabatan_perkaderan ?? 'Peserta'
                        ]
                    );
                }
            } else {
                PerkaderanStudent::where('student_id', $student->id)
                    ->where('tahun_ajaran', $activeYear->name)
                    ->delete();
            }

            DB::commit();
            return response()->json(['success' => true, 'data' => $student], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal memperbarui data'], 500);
        }
    }

    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan'], 404);
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

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['success' => false, 'message' => 'Tahun Pelajaran belum diatur.'], 400);
        }

        $studentsData = $request->students;
        $insertedCount = 0;

        $allExculs = Excul::all();
        $allPerkaderans = Perkaderan::all();
        
        DB::beginTransaction();
        try {
            foreach ($studentsData as $data) {
                if (empty($data['name']) || empty($data['class']) || empty($data['exculName'])) {
                    continue;
                }

                // Logika Anti-Double: Cari berdasarkan NIS, jika kosong cari berdasarkan Nama & Kelas
                $matchThese = [];
                if (!empty($data['nis'])) {
                    $matchThese['nis'] = $data['nis'];
                } else {
                    $matchThese['name'] = $data['name'];
                    $matchThese['class'] = $data['class'];
                }

                $student = Student::updateOrCreate(
                    $matchThese,
                    [
                        'name' => $data['name'],
                        'class' => $data['class'],
                        'nisn' => $data['nisn'] ?? null,
                        'jenis_kelamin' => $data['jenis_kelamin'] ?? null,
                        'angkatan' => $data['angkatan'] ?? null,
                        'jabatan_organisasi' => $data['jabatan_organisasi'] ?? null,
                        'is_active' => true
                    ]
                );

                $exculNamesArray = array_map('trim', explode(',', $data['exculName']));
                $perkaderanNamesArray = isset($data['perkaderanName']) && $data['perkaderanName'] != '' ? array_map('trim', explode(',', $data['perkaderanName'])) : [];

                $syncData = [];
                foreach ($exculNamesArray as $exName) {
                    $excul = $allExculs->first(function($item) use ($exName) {
                        return strtolower(trim($item->name)) === strtolower($exName);
                    });
                    if ($excul) {
                        $syncData[$excul->id] = ['academic_year_id' => $activeYear->id, 'is_active' => true];
                    }
                }
                
                if (count($syncData) > 0) {
                    // Gunakan syncWithoutDetaching agar ekskul sebelumnya tidak hilang
                    $student->exculs()->syncWithoutDetaching($syncData);
                }

                if (count($perkaderanNamesArray) > 0) {
                    foreach($perkaderanNamesArray as $pkName) {
                        $pk = $allPerkaderans->first(function($item) use ($pkName) {
                            return strtolower(trim($item->nama_jenjang)) === strtolower($pkName);
                        });

                        if($pk) {
                            PerkaderanStudent::updateOrCreate(
                                [
                                    'student_id' => $student->id,
                                    'perkaderan_id' => $pk->id,
                                    'tahun_ajaran' => $activeYear->name,
                                ],
                                [
                                    'semester' => $activeYear->semester,
                                    'status' => 'Aktif',
                                    'jabatan' => $data['jabatan_perkaderan'] ?? 'Peserta'
                                ]
                            );
                        }
                    }
                }

                $insertedCount++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal import: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil import/update siswa',
            'data' => ['count' => $insertedCount]
        ], 201);
    }
    public function getStudentList(Request $request)
    {
        $students = Student::where('is_active', true)
            ->orderBy('name', 'asc')
            ->select('id', 'name', 'class')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $students
        ], 200);
    }

    public function destroyMultiple(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id'
        ]);

        $studentIds = $request->ids;
        $students = Student::whereIn('id', $studentIds)->get();

        foreach ($students as $student) {
            if ($student->foto && File::exists(public_path('uploads/students/' . $student->foto))) {
                File::delete(public_path('uploads/students/' . $student->foto));
            }
        }
        Student::whereIn('id', $studentIds)->delete();

        return response()->json([
            'success' => true,
            'message' => count($studentIds) . ' data siswa berhasil dihapus secara massal'
        ], 200);
    }
    public function wipeData(Request $request)
    {
        $students = Student::whereNotNull('foto')->get();
        
        foreach ($students as $student) {
            if (File::exists(public_path('uploads/students/' . $student->foto))) {
                File::delete(public_path('uploads/students/' . $student->foto));
            }
        }

        Student::query()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Seluruh data siswa dan riwayatnya berhasil dikosongkan.'
        ], 200);
    }

    public function bulkAssignExcul(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'excul_id' => 'required|exists:exculs,id'
        ]);

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['success' => false, 'message' => 'Tahun Pelajaran belum diatur.'], 400);
        }

        $students = Student::whereIn('id', $request->student_ids)->get();
        $exculId = $request->excul_id;

        $syncData = [
            $exculId => ['academic_year_id' => $activeYear->id, 'is_active' => true]
        ];

        foreach ($students as $student) {
            $student->exculs()->syncWithoutDetaching($syncData);
        }

        return response()->json([
            'success' => true,
            'message' => count($request->student_ids) . ' siswa berhasil ditambahkan ke ekstrakurikuler'
        ], 200);
    }

    public function storeByMentor(Request $request)
    {
        // Tangkap exculId dari frontend dan jadikan array
        if ($request->has('exculId')) {
            $request->merge(['excul_id' => [$request->exculId]]);
        }

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'excul_id' => 'required|array',
            'excul_id.*' => 'exists:exculs,id'
        ]);

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['success' => false, 'message' => 'Tahun Pelajaran belum diatur.'], 400);
        }

        DB::beginTransaction();
        try {
            $student = Student::find($request->student_id);

            $syncData = [];
            foreach ($request->excul_id as $exculId) {
                $syncData[$exculId] = ['academic_year_id' => $activeYear->id, 'is_active' => true];
            }

            // Tambahkan relasi ke ekskul tanpa menghapus ekskul pilihannya yang lain
            $student->exculs()->syncWithoutDetaching($syncData);

            DB::commit();
            return response()->json(['success' => true, 'data' => $student], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan sistem.'], 500);
        }
    }
}