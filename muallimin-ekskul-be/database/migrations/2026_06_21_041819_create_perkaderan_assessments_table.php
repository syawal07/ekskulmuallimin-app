<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perkaderan_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perkaderan_student_id')->constrained('perkaderan_students')->onDelete('cascade');
            $table->string('nilai');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perkaderan_assessments');
    }
};