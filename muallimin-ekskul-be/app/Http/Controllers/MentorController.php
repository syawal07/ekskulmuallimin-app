<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class MentorController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['mentoringExculs', 'perkaderans'])
            ->whereIn('role', ['MENTOR', 'PEMBINA']);

        if ($request->has('role') && $request->role != '') {
            $query->where('role', $request->role);
        }

        if ($request->has('q') && $request->q != '') {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->q . '%')
                  ->orWhere('username', 'like', '%' . $request->q . '%');
            });
        }

        $limit = $request->query('limit', 10);
        $mentors = $query->orderBy('name', 'asc')->paginate($limit);

        return response()->json([
            'success' => true,
            'data' => $mentors
        ], 200);
    }

    public function import(Request $request)
    {
        $request->validate([
            'mentors' => 'required|array'
        ]);

        $mentorsData = $request->mentors;
        $insertedCount = 0;
        $allExculs = \App\Models\Excul::all();

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            foreach ($mentorsData as $data) {
                if (empty($data['name']) || empty($data['username'])) {
                    continue;
                }

                $mentor = User::updateOrCreate(
                    ['username' => strtolower($data['username'])],
                    [
                        'name' => $data['name'],
                        'password' => Hash::make($data['password'] ?? 'kampusterpadu'),
                        'role' => $data['role'] ?? 'MENTOR'
                    ]
                );

                if (!empty($data['exculName'])) {
                    $exculNamesArray = array_map('trim', explode(',', $data['exculName']));
                    $syncData = [];

                    foreach ($exculNamesArray as $exName) {
                        $excul = $allExculs->first(function($item) use ($exName) {
                            return strtolower(trim($item->name)) === strtolower($exName);
                        });
                        if ($excul) {
                            $syncData[] = $excul->id;
                        }
                    }

                    if (count($syncData) > 0) {
                        $mentor->mentoringExculs()->syncWithoutDetaching($syncData);
                    }
                }

                $insertedCount++;
            }
            \Illuminate\Support\Facades\DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Berhasil import/update data pelatih',
                'data' => ['count' => $insertedCount]
            ], 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'success' => false, 
                'message' => 'Gagal import: ' . $e->getMessage()
            ], 500);
        }
    }

    public function wipeData(Request $request)
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $mentors = User::whereIn('role', ['MENTOR', 'PEMBINA'])->get();
            
            foreach ($mentors as $mentor) {
                $hasAttendance = \App\Models\Attendance::where('recorder_id', $mentor->id)->exists();
                
                $mentor->mentoringExculs()->detach();
                $mentor->perkaderans()->detach();
                
                if (!$hasAttendance) {
                    $mentor->delete();
                }
            }

            \Illuminate\Support\Facades\DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Seluruh data pelatih berhasil dibersihkan.'
            ], 200);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'success' => false, 
                'message' => 'Gagal mengosongkan data.'
            ], 500);
        }
    }

    public function show($id)
    {
        $mentor = User::with(['mentoringExculs', 'perkaderans'])
            ->whereIn('role', ['MENTOR', 'PEMBINA'])
            ->find($id);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $mentor
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:6',
            'role' => 'required|in:MENTOR,PEMBINA',
            'excul_ids' => 'nullable|array',
            'excul_ids.*' => 'exists:exculs,id',
            'perkaderan_ids' => 'nullable|array',
            'perkaderan_ids.*' => 'exists:perkaderans,id'
        ]);

        $mentor = User::create([
            'name' => $request->name,
            'username' => strtolower($request->username),
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);

        if ($request->has('excul_ids') && is_array($request->excul_ids)) {
            $mentor->mentoringExculs()->attach($request->excul_ids);
        }

        if ($request->has('perkaderan_ids') && is_array($request->perkaderan_ids)) {
            $mentor->perkaderans()->attach($request->perkaderan_ids);
        }

        return response()->json([
            'success' => true,
            'data' => $mentor->load(['mentoringExculs', 'perkaderans'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $mentor = User::whereIn('role', ['MENTOR', 'PEMBINA'])->find($id);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                Rule::unique('users')->ignore($mentor->id),
            ],
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:MENTOR,PEMBINA',
            'excul_ids' => 'nullable|array',
            'excul_ids.*' => 'exists:exculs,id',
            'perkaderan_ids' => 'nullable|array',
            'perkaderan_ids.*' => 'exists:perkaderans,id'
        ]);

        $updateData = [
            'name' => $request->name,
            'username' => strtolower($request->username),
            'role' => $request->role
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $mentor->update($updateData);

        if ($request->has('excul_ids') && is_array($request->excul_ids)) {
            $mentor->mentoringExculs()->sync($request->excul_ids);
        } else {
            $mentor->mentoringExculs()->detach();
        }

        if ($request->has('perkaderan_ids') && is_array($request->perkaderan_ids)) {
            $mentor->perkaderans()->sync($request->perkaderan_ids);
        } else {
            $mentor->perkaderans()->detach();
        }

        return response()->json([
            'success' => true,
            'data' => $mentor->load(['mentoringExculs', 'perkaderans'])
        ], 200);
    }

    public function destroy($id)
    {
        $mentor = User::whereIn('role', ['MENTOR', 'PEMBINA'])->find($id);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $mentor->mentoringExculs()->detach();
        $mentor->perkaderans()->detach();
        $mentor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil dihapus'
        ], 200);
    }
}