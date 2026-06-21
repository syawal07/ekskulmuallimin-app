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
                'nama_jenjang' => 'Pra TKM',
                'deskripsi' => 'Jenjang persiapan awal untuk pengenalan dasar organisasi dan karakter.'
            ],
            [
                'nama_jenjang' => 'TKM 1',
                'deskripsi' => 'Taruna Melati Tingkat 1 - Fokus pada pembentukan karakter dan kepemimpinan dasar santri.'
            ],
            [
                'nama_jenjang' => 'TKM 2',
                'deskripsi' => 'Taruna Melati Tingkat 2 - Pengembangan kapasitas manajerial dan kepemimpinan menengah.'
            ],
            [
                'nama_jenjang' => 'TKM 3',
                'deskripsi' => 'Taruna Melati Tingkat 3 - Kematangan kepemimpinan tingkat lanjut dan kesiapan pengabdian.'
            ]
        ];

        foreach ($data as $item) {
            Perkaderan::create($item);
        }
    }
}