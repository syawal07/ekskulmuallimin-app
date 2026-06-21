<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required'
        ]);

        // 1. Cek prioritas pertama: Admin atau Mentor di tabel users
        $user = User::where('username', $request->username)->first();

        if ($user) {
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username atau password salah!'
                ], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'role' => $user->role,
                    ],
                    'token' => $token
                ]
            ], 200);
        }

        // 2. Jika tidak ada di users, cek di tabel students (Untuk Wali Santri)
        $student = Student::where('nis', $request->username)->first();

        if ($student) {
            // Password wali santri adalah NISN-nya sendiri
            if ($request->password !== $student->nis) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username atau password wali salah!'
                ], 401);
            }

            $token = $student->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login Wali Santri berhasil',
                'data' => [
                    'user' => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'username' => $student->nis,
                        'role' => 'wali', // Di-hardcode agar frontend (middleware) mengenali role ini
                    ],
                    'token' => $token
                ]
            ], 200);
        }

        // 3. Jika tidak ditemukan di kedua tabel
        return response()->json([
            'success' => false,
            'message' => 'Akun tidak ditemukan!'
        ], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ], 200);
    }
}