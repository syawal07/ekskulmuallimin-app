<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class MentorController extends Controller
{
    public function index()
    {
        $mentors = User::with('mentoringExculs')
            ->where('role', 'MENTOR')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $mentors
        ], 200);
    }

    public function show($id)
    {
        $mentor = User::with('mentoringExculs')->where('role', 'MENTOR')->find($id);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan'
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
            'excul_ids' => 'nullable|array',
            'excul_ids.*' => 'exists:exculs,id'
        ]);

        $mentor = User::create([
            'name' => $request->name,
            'username' => strtolower($request->username),
            'password' => Hash::make($request->password),
            'role' => 'MENTOR'
        ]);

        if ($request->has('excul_ids') && is_array($request->excul_ids)) {
            $mentor->mentoringExculs()->attach($request->excul_ids);
        }

        return response()->json([
            'success' => true,
            'data' => $mentor->load('mentoringExculs')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $mentor = User::where('role', 'MENTOR')->find($id);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan'
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
            'excul_ids' => 'nullable|array',
            'excul_ids.*' => 'exists:exculs,id'
        ]);

        $updateData = [
            'name' => $request->name,
            'username' => strtolower($request->username),
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

        return response()->json([
            'success' => true,
            'data' => $mentor->load('mentoringExculs')
        ], 200);
    }

    public function destroy($id)
    {
        $mentor = User::where('role', 'MENTOR')->find($id);

        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Mentor tidak ditemukan'
            ], 404);
        }

        $mentor->mentoringExculs()->detach();
        $mentor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mentor berhasil dihapus'
        ], 200);
    }
}