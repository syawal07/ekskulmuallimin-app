<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Perkaderan;

class PerkaderanSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'nama_jenjang' => 'Fortasi',
                'kategori' => 'Wajib',
                'target_kelas' => '1',
                'deskripsi' => 'Forum Ta\'aruf dan Orientasi Siswa'
            ],
            [
                'nama_jenjang' => 'PKTM 1 IPM',
                'kategori' => 'Wajib',
                'target_kelas' => '4',
                'deskripsi' => 'Pelatihan Kader Taruna Melati Tingkat 1'
            ],
            [
                'nama_jenjang' => 'UKT HW 1 (Purwa)',
                'kategori' => 'Pendukung Utama',
                'target_kelas' => '1',
                'deskripsi' => 'Ujian Kenaikan Tingkat HW Tingkat Purwa'
            ],
            [
                'nama_jenjang' => 'UKT HW 2 (Madya)',
                'kategori' => 'Pendukung Utama',
                'target_kelas' => '2',
                'deskripsi' => 'Ujian Kenaikan Tingkat HW Tingkat Madya'
            ],
            [
                'nama_jenjang' => 'UKT TS Melati 1',
                'kategori' => 'Pendukung Utama',
                'target_kelas' => '1',
                'deskripsi' => 'Ujian Kenaikan Tingkat Tapak Suci Melati 1'
            ],
            [
                'nama_jenjang' => 'UKT TS Melati 4',
                'kategori' => 'Pendukung Utama',
                'target_kelas' => '4',
                'deskripsi' => 'Ujian Kenaikan Tingkat Tapak Suci Melati 4'
            ],
            [
                'nama_jenjang' => 'Darul Arqam 1',
                'kategori' => 'Pendukung Khusus',
                'target_kelas' => '1',
                'deskripsi' => 'Pembinaan Darul Arqam tingkat dasar'
            ],
            [
                'nama_jenjang' => 'Mubaligh Hijrah',
                'kategori' => 'Pendukung Khusus',
                'target_kelas' => 'Semua Kelas',
                'deskripsi' => 'Program pengabdian masyarakat dan dakwah'
            ]
        ];

        foreach ($data as $item) {
            Perkaderan::create($item);
        }
    }
}