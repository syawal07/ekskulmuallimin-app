<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Excul;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'username' => 'adminekskulmuin',
            'password' => Hash::make('Muin1918@_'),
            'role' => 'ADMIN',
        ]);

        $ekskulInduk = [
            "Bahasa", "Robotik", "MUIN TV", "68 Store", "Desain Grafis", 
            "Karya Ilmiah Remaja", "Keagamaan", "Jurnalistik", "Atletik", 
            "Informatika dan Teknologi", "PMR", "Kaligrafi", "Qiroah MTs-MA", 
            "Hadroh", "Musik", "Tonti", "Panahan Modern", "Tapak Suci", 
            "Tenis Meja", "Sepak Takraw", "Bola Voli", "Bulutangkis", 
            "Bola Basket", "Sepak Bola", "Futsal"
        ];

        foreach ($ekskulInduk as $item) {
            $exculName = $item . ' (Induk)';
            $cleanUsername = strtolower(str_replace([' ', '-'], '', $item)) . 'induk';
            
            $excul = Excul::create([
                'name' => $exculName,
                'location' => 'INDUK'
            ]);

            $user = User::create([
                'name' => 'Mentor ' . $item,
                'username' => $cleanUsername,
                'password' => Hash::make('password123'),
                'role' => 'MENTOR',
            ]);

            $user->mentoringExculs()->attach($excul->id);
        }

        $ekskulTerpadu = [
            "Marching Band", "Olympiade Sains", "Bahasa", "Robotik", "MUIN TV", 
            "68 Store", "Desain Grafis", "Karya Ilmiah Remaja", "Jurnalistik", 
            "Keagamaan", "Atletik", "Informatika dan Teknologi", "PMR", 
            "Kaligrafi", "Tonti", "Qiroah MA", "Qiroah MTs", "Hadroh", "Musik", 
            "Panahan Modern", "Tapak Suci", "Tenis Meja", "Bulutangkis", 
            "Sepak Takraw", "Bola Voli", "Bola Basket", "Sepak Bola", "Futsal"
        ];

        foreach ($ekskulTerpadu as $item) {
            $exculName = $item . ' (Sedayu)';
            $cleanUsername = strtolower(str_replace([' ', '-'], '', $item)) . 'sedayu';
            
            $excul = Excul::create([
                'name' => $exculName,
                'location' => 'TERPADU'
            ]);

            $user = User::create([
                'name' => 'Mentor ' . $item,
                'username' => $cleanUsername,
                'password' => Hash::make('password123'),
                'role' => 'MENTOR',
            ]);

            $user->mentoringExculs()->attach($excul->id);
        }

        $this->call([
            PerkaderanSeeder::class
        ]);
    }
}