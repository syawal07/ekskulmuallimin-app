<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perkaderans', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jenjang');
            $table->enum('kategori', ['Wajib', 'Pendukung Utama', 'Pendukung Khusus'])->default('Wajib');
            $table->string('target_kelas')->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perkaderans');
    }
};