<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('excul_student', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('student_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('excul_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['excul_id']);
            $table->dropColumn('excul_id');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignUuid('excul_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->nullable()->constrained()->cascadeOnDelete();
        });

        Schema::table('perkaderan_students', function (Blueprint $table) {
            $table->string('jabatan')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('excul_student');

        Schema::table('students', function (Blueprint $table) {
            $table->foreignUuid('excul_id')->nullable()->constrained();
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['excul_id']);
            $table->dropColumn('excul_id');
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn('academic_year_id');
        });

        Schema::table('perkaderan_students', function (Blueprint $table) {
            $table->dropColumn('jabatan');
        });
    }
};