<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('excul_user', function (Blueprint $table) {
            $table->uuid('excul_id');
            $table->uuid('user_id');
            $table->timestamps();

            $table->foreign('excul_id')->references('id')->on('exculs')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->primary(['excul_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('excul_user');
    }
};