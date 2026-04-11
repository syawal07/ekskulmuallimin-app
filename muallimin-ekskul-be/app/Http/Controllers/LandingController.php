<?php

namespace App\Http\Controllers;

use App\Models\Excul;
use App\Models\Student;
use App\Models\CompanyProfile;
use App\Models\Gallery;

class LandingController extends Controller
{
    public function index()
    {
        $exculCount = Excul::count();
        $studentEnrollmentCount = Student::where('is_active', true)->count();
        $profile = CompanyProfile::first();
        $galleries = Gallery::orderBy('created_at', 'desc')->take(6)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'exculCount' => $exculCount,
                'studentEnrollmentCount' => $studentEnrollmentCount,
                'profile' => $profile,
                'galleries' => $galleries
            ]
        ], 200);
    }
}