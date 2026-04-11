<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->dateTime('date');
            $table->enum('status', ['HADIR', 'SAKIT', 'IZIN', 'ALPHA']);
            $table->string('notes')->nullable();
            $table->string('proof_image_url')->nullable();
            $table->uuid('student_id');
            $table->uuid('recorder_id');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('recorder_id')->references('id')->on('users');
            
            $table->index('date');
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};