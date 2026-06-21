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

        $mentors = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $mentors
        ], 200);
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