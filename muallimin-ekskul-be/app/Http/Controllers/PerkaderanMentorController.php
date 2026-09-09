<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Perkaderan;
use App\Models\PerkaderanStudent;
use App\Models\PerkaderanAttendance;
use App\Models\PerkaderanAssessment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PerkaderanMentorController extends Controller
{
public function getDashboard(Request $request)
    {
        $user = $request->user()->load('perkaderans');
        $perkaderans = $user->perkaderans;

        $activeYear = AcademicYear::where('is_active', true)->first();
        $tahunAjaran = $activeYear ? $activeYear->name : '-';

        $perkaderanStudentIds = PerkaderanStudent::whereIn('perkaderan_id', $perkaderans->pluck('id'))
            ->where('tahun_ajaran', $tahunAjaran)
            ->pluck('id');
            
        $totalStudents = $perkaderanStudentIds->count();

        // Hitung presensi yang dilakukan hari ini khusus untuk pembina ini
        $attendanceToday = PerkaderanAttendance::whereIn('perkaderan_student_id', $perkaderanStudentIds)
            ->whereDate('tanggal', Carbon::today()->toDateString())
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'mentor_name' => $user->name,
                'total_perkaderans' => $perkaderans->count(),
                'total_students' => $totalStudents,
                'attendance_today' => $attendanceToday, 
                'perkaderans' => $perkaderans
            ]
        ], 200);
    }

    public function getPresensiSetup(Request $request)
    {
        $user = $request->user()->load('perkaderans');
        $perkaderans = $user->perkaderans;
        $perkaderanId = $request->query('perkaderan_id') ?? $request->query('perkaderanId');
        $kelas = $request->query('kelas');
        
        // Tangkap parameter limit, default 10
        $limit = $request->query('limit', 10); 
        
        $activeYear = AcademicYear::where('is_active', true)->first();
        $tahunAjaran = $activeYear ? $activeYear->name : '-';
        $dateString = $request->query('date', Carbon::today()->toDateString());
        
        $students = [];
        $existingAttendance = [];
        $selectedPerkaderanName = null;
        $availableClasses = collect();
        $meta = null;

        if ($perkaderanId) {
            $selected = $perkaderans->where('id', $perkaderanId)->first();
            if ($selected) {
                $selectedPerkaderanName = $selected->nama_jenjang;

                // Ambil daftar kelas yang valid untuk ekskul ini
                $availableClasses = PerkaderanStudent::where('perkaderan_id', $perkaderanId)
                    ->where('tahun_ajaran', $tahunAjaran)
                    ->whereHas('student', function ($q) {
                        $q->where('is_active', true);
                    })
                    ->join('students', 'perkaderan_students.student_id', '=', 'students.id')
                    ->select('students.class')
                    ->distinct()
                    ->orderBy('students.class')
                    ->pluck('class');

                // Siapkan query utama
                $query = PerkaderanStudent::with('student')
                    ->where('perkaderan_id', $perkaderanId)
                    ->where('tahun_ajaran', $tahunAjaran)
                    ->join('students', 'perkaderan_students.student_id', '=', 'students.id')
                    ->where('students.is_active', true)
                    ->select('perkaderan_students.*');

                // Filter berdasarkan kelas jika dipilih
                if ($kelas) {
                    $query->where('students.class', $kelas);
                }

                // Logika Penentuan Limit Paginasi
                $totalCount = $query->count();
                $perPage = $limit === 'all' ? max(1, $totalCount) : (int) $limit;

                // Eksekusi Paginasi
                $paginatedStudents = $query->orderBy('students.class')
                    ->orderBy('students.name')
                    ->paginate($perPage);

                $students = $paginatedStudents->items();
                
                $meta = [
                    'current_page' => $paginatedStudents->currentPage(),
                    'last_page' => $paginatedStudents->lastPage(),
                    'total' => $paginatedStudents->total(),
                    'per_page' => $perPage
                ];

                // Ambil data presensi yang sudah ada hari ini khusus siswa yang dirender
                $attendances = PerkaderanAttendance::whereIn('perkaderan_student_id', collect($students)->pluck('id'))
                    ->whereDate('tanggal', Carbon::parse($dateString)->toDateString())
                    ->get();

                $existingAttendance = $attendances->map(function($att) {
                    return [
                        'perkaderan_student_id' => $att->perkaderan_student_id,
                        'status' => $att->status,
                        'keterangan' => $att->keterangan
                    ];
                });
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'perkaderans' => $perkaderans,
                'selectedPerkaderanId' => $perkaderanId,
                'selectedPerkaderanName' => $selectedPerkaderanName,
                'available_classes' => $availableClasses,
                'students' => collect($students)->map(function($ps) {
                    return [
                        'id' => $ps->id,
                        'student_name' => $ps->student->name,
                        'student_class' => $ps->student->class
                    ];
                }),
                'existing_attendance' => $existingAttendance,
                'meta' => $meta
            ]
        ], 200);
    }

  public function storePresensi(Request $request)
    {
        if ($request->has('perkaderanId')) {
            $request->merge(['perkaderan_id' => $request->perkaderanId]);
        }

        $request->validate([
            'date' => 'required|date',
            'perkaderan_id' => 'required|exists:perkaderans,id'
        ]);

        $date = Carbon::parse($request->date)->toDateString();
        
        DB::beginTransaction();
        try {
            $allInputs = $request->all();
            $processedCount = 0;
            
            foreach ($allInputs as $key => $status) {
                if (str_starts_with($key, 'status-')) {
                    $psId = str_replace('status-', '', $key);
                    $keterangan = $request->input("notes-{$psId}", '');

                    $statusFix = strtoupper($status);
                    if ($statusFix === 'ALPHA') {
                        $statusFix = 'ALPA'; 
                    }

                    $keteranganFinal = empty($keterangan) ? null : $keterangan;

                    $existing = PerkaderanAttendance::where('perkaderan_student_id', $psId)
                        ->whereDate('tanggal', $date)
                        ->first();

                    if ($existing) {
                        $existing->update([
                            'status' => $statusFix,
                            'keterangan' => $keteranganFinal
                        ]);
                    } else {
                        PerkaderanAttendance::create([
                            'perkaderan_student_id' => $psId,
                            'tanggal' => $date,
                            'status' => $statusFix,
                            'keterangan' => $keteranganFinal
                        ]);
                    }
                    
                    $processedCount++;
                }
            }
            
            if ($processedCount === 0) {
                DB::rollBack();
                return response()->json([
                    'success' => false, 
                    'message' => 'Tidak ada data presensi santri yang valid untuk disimpan.'
                ], 400);
            }
            
            DB::commit();
            return response()->json(['success' => true], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false, 
                'message' => 'Error DB: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getHistory(Request $request)
    {
        $user = $request->user()->load('perkaderans');
        $perkaderanIds = $user->perkaderans->pluck('id');
        
        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);

        // Tambahkan relasi 'student' untuk menarik data kelas
        $attendances = PerkaderanAttendance::with(['perkaderanStudent.perkaderan', 'perkaderanStudent.student'])
            ->whereHas('perkaderanStudent', function($q) use ($perkaderanIds) {
                $q->whereIn('perkaderan_id', $perkaderanIds);
            })
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->get();

        $historyData = [];
        
        // Grouping berdasarkan Tanggal, ID Perkaderan, dan Kelas
        $groupedAttendances = $attendances->groupBy(function($item) {
            $pId = $item->perkaderanStudent->perkaderan_id ?? 0;
            $kelas = $item->perkaderanStudent->student->class ?? 'Unknown';
            return Carbon::parse($item->tanggal)->format('Y-m-d') . '|' . $pId . '|' . $kelas;
        });

        foreach ($groupedAttendances as $key => $group) {
            $date = Carbon::parse($group->first()->tanggal)->format('Y-m-d');
            $perkaderanId = $group->first()->perkaderanStudent->perkaderan_id ?? 0;
            $perkaderanName = $group->first()->perkaderanStudent->perkaderan->nama_jenjang ?? 'Perkaderan';
            $kelas = $group->first()->perkaderanStudent->student->class ?? '-';
            
            $hadir = $group->filter(function($item) { return strtolower($item->status) === 'hadir'; })->count();
            $izin = $group->filter(function($item) { return strtolower($item->status) === 'izin'; })->count();
            $sakit = $group->filter(function($item) { return strtolower($item->status) === 'sakit'; })->count();
            $alpha = $group->filter(function($item) { return in_array(strtolower($item->status), ['alpa', 'alpha']); })->count();

            $historyData[] = [
                'id' => $key,
                'date' => $date,
                'perkaderanId' => $perkaderanId,
                'perkaderanName' => $perkaderanName,
                'kelas' => $kelas,
                'stats' => [
                    'HADIR' => $hadir,
                    'IZIN' => $izin,
                    'SAKIT' => $sakit,
                    'ALPHA' => $alpha
                ]
            ];
        }

        usort($historyData, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return response()->json([
            'success' => true,
            'data' => $historyData
        ], 200);
    }

    public function destroySession(Request $request)
    {
        $dateString = $request->query('date');
        $perkaderanId = $request->query('perkaderan_id') ?? $request->query('perkaderanId');
        $kelas = $request->query('kelas'); // Menangkap parameter kelas
        
        if (!$dateString || !$perkaderanId) {
            return response()->json(['success' => false, 'message' => 'Parameter tidak lengkap.'], 400);
        }

        $date = Carbon::parse($dateString)->toDateString();
        
        $query = PerkaderanAttendance::whereHas('perkaderanStudent', function($q) use ($perkaderanId, $kelas) {
            $q->where('perkaderan_id', $perkaderanId);
            if ($kelas) {
                // Hanya hapus presensi milik kelas yang dipilih
                $q->whereHas('student', function($sq) use ($kelas) {
                    $sq->where('class', $kelas);
                });
            }
        })->whereDate('tanggal', $date);

        $deleted = $query->delete();
        
        return response()->json(['success' => true, 'message' => "$deleted presensi dihapus."], 200);
    }

    public function getPenilaian(Request $request)
    {
        $user = $request->user()->load('perkaderans');
        $perkaderans = $user->perkaderans;
        $perkaderanId = $request->query('perkaderan_id') ?? $request->query('perkaderanId');
        $kelas = $request->query('kelas');
        
        // Tangkap parameter limit, default 10
        $limit = $request->query('limit', 10);
        
        $activeYear = AcademicYear::where('is_active', true)->first();
        $tahunAjaran = $activeYear ? $activeYear->name : '-';
        
        $students = [];
        $availableClasses = collect();
        $meta = null;

        if ($perkaderanId) {
            $availableClasses = PerkaderanStudent::where('perkaderan_id', $perkaderanId)
                ->where('tahun_ajaran', $tahunAjaran)
                ->whereHas('student', function ($q) {
                    $q->where('is_active', true);
                })
                ->join('students', 'perkaderan_students.student_id', '=', 'students.id')
                ->select('students.class')
                ->distinct()
                ->orderBy('students.class')
                ->pluck('class');

            $query = PerkaderanStudent::with(['student', 'assessments'])
                ->where('perkaderan_id', $perkaderanId)
                ->where('tahun_ajaran', $tahunAjaran)
                ->join('students', 'perkaderan_students.student_id', '=', 'students.id')
                ->where('students.is_active', true)
                ->select('perkaderan_students.*');

            if ($kelas) {
                $query->where('students.class', $kelas);
            }

            // Logika Penentuan Limit Paginasi
            $totalCount = $query->count();
            $perPage = $limit === 'all' ? max(1, $totalCount) : (int) $limit;

            $paginatedStudents = $query->orderBy('students.class')
                ->orderBy('students.name')
                ->paginate($perPage);

            $students = collect($paginatedStudents->items())->map(function($ps) {
                $assessment = $ps->assessments->first();
                return [
                    'perkaderan_student_id' => $ps->id,
                    'student_name' => $ps->student ? $ps->student->name : '-',
                    'student_class' => $ps->student ? $ps->student->class : '-',
                    'nilai' => $assessment ? $assessment->nilai : null,
                    'catatan' => $assessment ? $assessment->catatan : ''
                ];
            });

            $meta = [
                'current_page' => $paginatedStudents->currentPage(),
                'last_page' => $paginatedStudents->lastPage(),
                'total' => $paginatedStudents->total(),
                'per_page' => $perPage
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'perkaderans' => $perkaderans,
                'available_classes' => $availableClasses,
                'assessments' => $students,
                'meta' => $meta
            ]
        ], 200);
    }

    public function storePenilaian(Request $request)
    {
        $request->validate([
            'perkaderan_student_id' => 'required|exists:perkaderan_students,id',
            'nilai' => 'required|integer|min:0|max:100',
            'catatan' => 'nullable|string'
        ]);

        $assessment = PerkaderanAssessment::updateOrCreate(
            ['perkaderan_student_id' => $request->perkaderan_student_id],
            ['nilai' => $request->nilai, 'catatan' => $request->catatan]
        );

        return response()->json(['success' => true, 'message' => 'Nilai berhasil disimpan'], 200);
    }

    // Mengambil daftar siswa yang BELUM terdaftar di perkaderan ini
    public function getUnregisteredStudents(Request $request)
    {
        $perkaderanId = $request->query('perkaderan_id') ?? $request->query('perkaderanId');
        $search = $request->query('q'); // Query pencarian
        
        if (!$perkaderanId) {
            return response()->json(['success' => false, 'message' => 'Perkaderan ID wajib diisi'], 400);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();
        $tahunAjaran = $activeYear ? $activeYear->name : '-';

        // Cari siswa aktif yang BELUM ada di pivot perkaderan_students untuk kegiatan ini
        $query = \App\Models\Student::where('is_active', true)
            ->whereDoesntHave('perkaderans', function ($q) use ($perkaderanId, $tahunAjaran) {
                $q->where('perkaderan_id', $perkaderanId)
                  ->where('tahun_ajaran', $tahunAjaran);
            });

        // Fitur pencarian (berdasarkan nama, kelas, atau nis)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('nis', 'like', '%' . $search . '%')
                  ->orWhere('class', 'like', '%' . $search . '%');
            });
        }

        // Limit data maksimal 50 agar query sangat ringan dan API responsif
        $students = $query->orderBy('class')
            ->orderBy('name')
            ->take(50)
            ->get(['id', 'name', 'nis', 'class']);

        return response()->json([
            'success' => true,
            'data' => $students
        ], 200);
    }

    // Mendaftarkan siswa susulan ke dalam perkaderan
    public function enrollStudent(Request $request)
    {
        $request->validate([
            'perkaderan_id' => 'required|exists:perkaderans,id',
            'student_ids' => 'required|array', // Menggunakan array agar bisa input banyak sekaligus
            'student_ids.*' => 'exists:students,id'
        ]);

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['success' => false, 'message' => 'Tahun Pelajaran belum diatur'], 400);
        }

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            foreach ($request->student_ids as $sId) {
                // updateOrCreate untuk mencegah duplikat/error jika diklik 2x
                \App\Models\PerkaderanStudent::updateOrCreate(
                    [
                        'student_id' => $sId,
                        'perkaderan_id' => $request->perkaderan_id,
                        'tahun_ajaran' => $activeYear->name,
                    ],
                    [
                        'semester' => $activeYear->semester,
                        'status' => 'Aktif',
                        'jabatan' => 'Peserta'
                    ]
                );
            }
            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($request->student_ids) . ' siswa berhasil didaftarkan ke kegiatan.'
            ], 200);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal mendaftarkan siswa: ' . $e->getMessage()], 500);
        }
    }
}