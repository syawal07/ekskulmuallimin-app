<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'nisn')) {
                $table->string('nisn')->nullable()->after('nis');
            }
            
            if (!Schema::hasColumn('students', 'jenis_kelamin')) {
                $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('name');
            }
            
            if (!Schema::hasColumn('students', 'angkatan')) {
                $table->string('angkatan')->nullable()->after('class');
            }
            
            if (!Schema::hasColumn('students', 'foto')) {
                $table->string('foto')->nullable()->after('is_active');
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $columnsToDrop = [];
            
            if (Schema::hasColumn('students', 'nisn')) $columnsToDrop[] = 'nisn';
            if (Schema::hasColumn('students', 'jenis_kelamin')) $columnsToDrop[] = 'jenis_kelamin';
            if (Schema::hasColumn('students', 'angkatan')) $columnsToDrop[] = 'angkatan';
            if (Schema::hasColumn('students', 'foto')) $columnsToDrop[] = 'foto';
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};