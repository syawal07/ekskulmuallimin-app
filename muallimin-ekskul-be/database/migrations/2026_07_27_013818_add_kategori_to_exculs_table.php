<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('exculs', function (Blueprint $table) {
            $table->enum('kategori', ['Wajib', 'Pilihan'])->default('Pilihan')->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('exculs', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });
    }
};