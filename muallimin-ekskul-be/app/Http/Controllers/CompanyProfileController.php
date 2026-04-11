<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class CompanyProfileController extends Controller
{
    // Menampilkan profil (otomatis buat default jika kosong)
    public function show()
    {
        $profile = CompanyProfile::first();

        if (!$profile) {
            $profile = CompanyProfile::create([
                'school_name' => "Madrasah Mu'allimin",
                'hero_title' => "Wadah Kreativitas",
                'hero_subtitle' => "Kader Pemimpin",
                'hero_description' => "Platform digital manajemen kegiatan ekstrakurikuler untuk memantau perkembangan minat dan bakat secara real-time.",
                'about_text' => "Madrasah Mu'allimin Muhammadiyah Yogyakarta adalah sekolah kader persyarikatan yang berkomitmen mencetak calon pemimpin umat dan bangsa."
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $profile
        ], 200);
    }

    // Update profil dan upload gambar
    public function update(Request $request)
    {
        $profile = CompanyProfile::first();

        // 1. Update data teks
        $fillableTexts = [
            'school_name', 'hero_title', 'hero_subtitle', 'hero_description', 
            'about_text', 'address', 'email', 'phone', 'website', 
            'login_quote', 'login_quote_author'
        ];

        foreach ($fillableTexts as $field) {
            if ($request->has($field)) {
                $profile->{$field} = $request->input($field);
            }
        }

        // 2. Handle Upload Gambar
        $this->handleFileUpload($request, $profile, 'logo', 'logo_url');
        $this->handleFileUpload($request, $profile, 'heroImage', 'hero_image_url');
        $this->handleFileUpload($request, $profile, 'loginImage', 'login_image_url');

        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => $profile
        ], 200);
    }

    // Helper untuk fungsi upload agar rapi
    private function handleFileUpload(Request $request, $profile, $inputKey, $columnName)
    {
        if ($request->hasFile($inputKey)) {
            $file = $request->file($inputKey);
            $filename = $inputKey . '-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/cms');

            // Buat folder jika belum ada
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }

            // Hapus gambar lama jika ada (Biar server nggak kepenuhan)
            if ($profile->{$columnName}) {
                $oldImagePath = public_path($profile->{$columnName});
                if (File::exists($oldImagePath) && $profile->{$columnName} !== '/logo.png') {
                    File::delete($oldImagePath);
                }
            }

            // Simpan gambar baru
            $file->move($destinationPath, $filename);
            $profile->{$columnName} = '/uploads/cms/' . $filename;
        }
    }
}