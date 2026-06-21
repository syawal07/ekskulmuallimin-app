<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perkaderan_user', function (Blueprint $table) {
            $table->id();
            // Menggunakan foreignUuid karena tabel users memakai UUID
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            // Tetap foreignId karena tabel perkaderans memakai ID biasa
            $table->foreignId('perkaderan_id')->constrained('perkaderans')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perkaderan_user');
    }
};