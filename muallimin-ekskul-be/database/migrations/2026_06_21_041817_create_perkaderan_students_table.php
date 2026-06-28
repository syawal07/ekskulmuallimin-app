<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perkaderan_students', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('perkaderan_id')->constrained('perkaderans')->onDelete('cascade');
            $table->string('tahun_ajaran');
            $table->string('semester');
            $table->enum('status', ['Aktif', 'Lulus', 'Gagal'])->default('Aktif');
            $table->string('jabatan')->default('Peserta');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perkaderan_students');
    }
};