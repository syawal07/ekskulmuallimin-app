<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validasi inputan dari Next.js
        $request->validate([
            'username' => 'required',
            'password' => 'required'
        ]);

        // 2. Cari user di database
        $user = User::where('username', $request->username)->first();

        // 3. Cek apakah user ada dan passwordnya cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah!'
            ], 401);
        }

        // 4. Buatkan Token Sakti (Pengganti jose session)
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Kirim balasan ke Next.js
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

    public function logout(Request $request)
    {
        // Hapus token saat ini (Logout)
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ], 200);
    }
}