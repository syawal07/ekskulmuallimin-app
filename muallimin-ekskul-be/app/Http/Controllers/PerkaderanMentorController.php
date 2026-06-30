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
        
        $activeYear = AcademicYear::where('is_active', true)->first();
        $tahunAjaran = $activeYear ? $activeYear->name : '-';
        $dateString = $request->query('date', Carbon::today()->toDateString());

        $students = [];
        $existingAttendance = [];
        $selectedPerkaderanName = null;

        if ($perkaderanId) {
            $selected = $perkaderans->where('id', $perkaderanId)->first();
            if ($selected) {
                $selectedPerkaderanName = $selected->nama_jenjang;

                $students = PerkaderanStudent::with('student')
                    ->where('perkaderan_id', $perkaderanId)
                    ->where('tahun_ajaran', $tahunAjaran)
                    ->get()
                    ->sortBy(function($ps) {
                        return $ps->student ? $ps->student->name : '';
                    })->values();

                $attendances = PerkaderanAttendance::whereIn('perkaderan_student_id', $students->pluck('id'))
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
                'students' => $students,
                'existing_attendance' => $existingAttendance
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
            
            foreach ($allInputs as $key => $status) {
                if (str_starts_with($key, 'status-')) {
                    $psId = str_replace('status-', '', $key);
                    $keterangan = $request->input("notes-{$psId}", '');

                    // --- KUNCI PENYELESAIAN ERROR TRUNCATED ---
                    // Mengubah 'ALPHA' menjadi 'ALPA' agar sesuai dengan ENUM database bahasa Indonesia
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
                }
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

        $attendances = PerkaderanAttendance::with('perkaderanStudent.perkaderan')
            ->whereHas('perkaderanStudent', function($q) use ($perkaderanIds) {
                $q->whereIn('perkaderan_id', $perkaderanIds);
            })
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->get();

        $historyData = [];
        $groupedAttendances = $attendances->groupBy(function($item) {
            // Pengaman tambahan jika perkaderan_id null
            $pId = $item->perkaderanStudent->perkaderan_id ?? 0;
            return Carbon::parse($item->tanggal)->format('Y-m-d') . '|' . $pId;
        });

        foreach ($groupedAttendances as $key => $group) {
            $date = Carbon::parse($group->first()->tanggal)->format('Y-m-d');
            $perkaderanId = $group->first()->perkaderanStudent->perkaderan_id ?? 0;
            $perkaderanName = $group->first()->perkaderanStudent->perkaderan->nama_jenjang ?? 'Perkaderan';
            
            // --- KUNCI PERBAIKAN: Gunakan strtolower() agar tidak peduli huruf besar/kecil ---
            $hadir = $group->filter(function($item) { return strtolower($item->status) === 'hadir'; })->count();
            $izin = $group->filter(function($item) { return strtolower($item->status) === 'izin'; })->count();
            $sakit = $group->filter(function($item) { return strtolower($item->status) === 'sakit'; })->count();
            
            // Tangkap ALPA maupun ALPHA sekaligus
            $alpha = $group->filter(function($item) { return in_array(strtolower($item->status), ['alpa', 'alpha']); })->count();

            $historyData[] = [
                'date' => $date,
                'perkaderanId' => $perkaderanId,
                'perkaderanName' => $perkaderanName,
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
        
        if (!$dateString || !$perkaderanId) {
            return response()->json(['success' => false, 'message' => 'Parameter tidak lengkap.'], 400);
        }

        $date = Carbon::parse($dateString)->toDateString();
        
        $deleted = PerkaderanAttendance::whereHas('perkaderanStudent', function($q) use ($perkaderanId) {
            $q->where('perkaderan_id', $perkaderanId);
        })->whereDate('tanggal', $date)->delete();

        return response()->json(['success' => true, 'message' => "$deleted presensi dihapus."], 200);
    }

    public function getPenilaian(Request $request)
    {
        $user = $request->user()->load('perkaderans');
        $perkaderans = $user->perkaderans;
        $perkaderanId = $request->query('perkaderan_id') ?? $request->query('perkaderanId');
        
        $activeYear = AcademicYear::where('is_active', true)->first();
        $tahunAjaran = $activeYear ? $activeYear->name : '-';

        $students = [];
        if ($perkaderanId) {
            $students = PerkaderanStudent::with(['student', 'assessments'])
                ->where('perkaderan_id', $perkaderanId)
                ->where('tahun_ajaran', $tahunAjaran)
                ->get()
                ->map(function($ps) {
                    $assessment = $ps->assessments->first();
                    return [
                        'perkaderan_student_id' => $ps->id,
                        'student_name' => $ps->student ? $ps->student->name : '-',
                        'student_class' => $ps->student ? $ps->student->class : '-',
                        'nilai' => $assessment ? $assessment->nilai : null,
                        'catatan' => $assessment ? $assessment->catatan : ''
                    ];
                })
                ->sortBy('student_name')->values();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'perkaderans' => $perkaderans,
                'assessments' => $students
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
}