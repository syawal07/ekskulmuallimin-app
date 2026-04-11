<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('nis')->nullable();
            $table->string('class');
            $table->boolean('is_active')->default(true);
            $table->uuid('excul_id');
            $table->timestamps();

            $table->foreign('excul_id')->references('id')->on('exculs')->onDelete('cascade');
            $table->index('excul_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};