<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('school_name')->default("Madrasah Mu'allimin Muhammadiyah");
            $table->string('logo_url')->nullable()->default('/logo.png');
            $table->string('hero_title')->default('Wadah Kreativitas');
            $table->string('hero_subtitle')->default('Kader Pemimpin');
            $table->text('hero_description');
            $table->string('hero_image_url')->nullable();
            $table->text('about_text');
            $table->string('address')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('login_image_url')->nullable();
            $table->text('login_quote')->nullable();
            $table->string('login_quote_author')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};