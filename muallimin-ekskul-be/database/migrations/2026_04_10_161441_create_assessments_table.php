<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Relasi ke tabel master
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('excul_id')->constrained('exculs')->cascadeOnDelete();
            $table->foreignUuid('mentor_id')->constrained('users')->cascadeOnDelete();
            
            // Data Penilaian
            $table->integer('score'); // Angka murni 0-100 yang diinput mentor
            $table->string('predicate', 2); // A/B/C/D/E
            $table->string('bloom_level'); // Naturalisasi, Artikulasi, dll
            $table->text('description'); // Narasi KKO otomatis
            $table->string('academic_year'); // Contoh: "2025/2026"
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};