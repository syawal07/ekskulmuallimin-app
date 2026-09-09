<?php

namespace App\Http\Controllers;

use App\Models\PerkaderanStudent;
use App\Models\Perkaderan;
use Illuminate\Http\Request;

class AdminPerkaderanMonitorController extends Controller
{
    public function index(Request $request)
    {
        $perkaderanId = $request->query('perkaderan_id');
        $kelas = $request->query('kelas');
        $limit = $request->query('limit', 10);
        $search = $request->query('q');

        $query = PerkaderanStudent::with(['student', 'perkaderan', 'assessments', 'attendances'])
            ->join('students', 'perkaderan_students.student_id', '=', 'students.id')
            ->select('perkaderan_students.*');

        if ($perkaderanId && $perkaderanId !== 'all') {
            $query->where('perkaderan_students.perkaderan_id', $perkaderanId);
        }

        if ($kelas && $kelas !== 'all') {
            $query->where('students.class', $kelas);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('students.name', 'like', '%' . $search . '%')
                  ->orWhere('students.nis', 'like', '%' . $search . '%');
            });
        }

        $totalCount = $query->count();
        $perPage = $limit === 'all' ? max(1, $totalCount) : (int) $limit;

        $paginated = $query->orderBy('students.class')
            ->orderBy('students.name')
            ->paginate($perPage);

        $data = collect($paginated->items())->map(function($ps) {
            $totalPertemuan = $ps->attendances->count();
            
            $hadir = $ps->attendances->filter(function($att) {
                return strtolower($att->status) === 'hadir';
            })->count();
            
            return [
                'id' => $ps->id,
                'student_id' => $ps->student_id,
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
            'jenjang_options' => Perkaderan::all(['id', 'nama_jenjang']),
            'classes' => \App\Models\Student::select('class')->distinct()->orderBy('class')->pluck('class'),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
                'per_page' => $perPage
            ]
        ], 200);
    }

    public function getUnregisteredStudents(Request $request)
    {
        $perkaderanId = $request->query('perkaderan_id');
        $search = $request->query('q');
        
        if (!$perkaderanId || $perkaderanId === 'all') {
            return response()->json(['success' => false], 400);
        }

        $activeYear = \App\Models\AcademicYear::where('is_active', true)->first();
        $tahunAjaran = $activeYear ? $activeYear->name : '-';

        $query = \App\Models\Student::where('is_active', true)
            ->whereDoesntHave('perkaderans', function ($q) use ($perkaderanId, $tahunAjaran) {
                $q->where('perkaderan_id', $perkaderanId)
                  ->where('tahun_ajaran', $tahunAjaran);
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('nis', 'like', '%' . $search . '%')
                  ->orWhere('class', 'like', '%' . $search . '%');
            });
        }

        $students = $query->orderBy('class')
            ->orderBy('name')
            ->take(50)
            ->get(['id', 'name', 'nis', 'class']);

        return response()->json([
            'success' => true,
            'data' => $students
        ], 200);
    }

    public function enrollStudent(Request $request)
    {
        $request->validate([
            'perkaderan_id' => 'required|exists:perkaderans,id',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id'
        ]);

        $activeYear = \App\Models\AcademicYear::where('is_active', true)->first();

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            foreach ($request->student_ids as $sId) {
                \App\Models\PerkaderanStudent::updateOrCreate(
                    [
                        'student_id' => $sId,
                        'perkaderan_id' => $request->perkaderan_id,
                        'tahun_ajaran' => $activeYear ? $activeYear->name : '-',
                    ],
                    [
                        'semester' => $activeYear ? $activeYear->semester : 'Ganjil',
                        'status' => 'Aktif',
                        'jabatan' => 'Peserta'
                    ]
                );
            }
            \Illuminate\Support\Facades\DB::commit();

            return response()->json(['success' => true], 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['success' => false], 500);
        }
    }
}