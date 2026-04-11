<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    protected $fillable = [
        'school_name', 'logo_url', 'hero_title', 'hero_subtitle', 
        'hero_description', 'hero_image_url', 'about_text', 
        'address', 'email', 'phone', 'website', 
        'login_image_url', 'login_quote', 'login_quote_author'
    ];
}