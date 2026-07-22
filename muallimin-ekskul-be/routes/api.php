<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExculController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AdminAttendanceController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\AdminAssessmentController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\PerkaderanController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\PerkaderanMentorController;
use App\Http\Controllers\AdminPerkaderanMonitorController;

// =====================================================================
// PUBLIC ROUTES (TIDAK PERLU LOGIN)
// =====================================================================
Route::post('/login', [AuthController::class, 'login']);
Route::get('/landing', [LandingController::class, 'index']);
Route::get('/public/news', [NewsController::class, 'publicIndex']);
Route::get('/public/news/{slug}', [NewsController::class, 'publicShow']);

// =====================================================================
// PROTECTED ROUTES (WAJIB LOGIN)
// =====================================================================
Route::middleware('auth:sanctum')->group(function () {
    
    // --- GLOBAL AUTH ROUTES ---
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- GLOBAL / SHARED DATA ROUTES ---
    // Akses terbuka bagi Role apapun yang sudah login untuk kebutuhan Filter Dropdown
    Route::get('/academic-years', [AcademicYearController::class, 'index']);
    Route::get('/academic-years/active', [AcademicYearController::class, 'getActive']);


    // =====================================================================
    // ROUTES KHUSUS ADMIN
    // =====================================================================
    Route::get('/admin/dashboard-stats', [DashboardController::class, 'adminStats']);

    // Admin - Manajemen Tahun Pelajaran
    Route::post('/academic-years', [AcademicYearController::class, 'store']);
    Route::put('/academic-years/{id}', [AcademicYearController::class, 'update']);
    Route::delete('/academic-years/{id}', [AcademicYearController::class, 'destroy']);
    Route::patch('/academic-years/{id}/set-active', [AcademicYearController::class, 'setActive']);

    // Admin - Manajemen Ekskul
    Route::get('/admin/exculs', [ExculController::class, 'index']);
    Route::post('/admin/exculs', [ExculController::class, 'store']);
    Route::put('/admin/exculs/{id}', [ExculController::class, 'update']);
    Route::delete('/admin/exculs/{id}', [ExculController::class, 'destroy']);

    // Admin - Manajemen Siswa
    Route::get('/admin/students', [StudentController::class, 'index']);
    Route::post('/admin/students', [StudentController::class, 'store']);
    Route::post('/admin/students/import', [StudentController::class, 'import']);
    Route::get('/admin/students/{id}', [StudentController::class, 'show']);
    Route::put('/admin/students/{id}', [StudentController::class, 'update']);
    Route::delete('/admin/students/{id}', [StudentController::class, 'destroy']);
    Route::post('/admin/students/bulk-delete', [StudentController::class, 'destroyMultiple']);
    Route::post('/admin/students/wipe', [StudentController::class, 'wipeData']);
    Route::post('/admin/students/bulk-assign-excul', [StudentController::class, 'bulkAssignExcul']);

    // Admin - Manajemen Mentor/Guru
    Route::get('/admin/mentors', [MentorController::class, 'index']);
    Route::post('/admin/mentors', [MentorController::class, 'store']);
    Route::get('/admin/mentors/{id}', [MentorController::class, 'show']);
    Route::put('/admin/mentors/{id}', [MentorController::class, 'update']);
    Route::delete('/admin/mentors/{id}', [MentorController::class, 'destroy']);
    Route::post('/admin/mentors/import', [MentorController::class, 'import']);
    Route::post('/admin/mentors/wipe', [MentorController::class, 'wipeData']);

    // Admin - Manajemen Perkaderan
    Route::get('/admin/perkaderans', [PerkaderanController::class, 'index']);
    Route::post('/admin/perkaderans', [PerkaderanController::class, 'store']);
    Route::get('/admin/perkaderans/{id}', [PerkaderanController::class, 'show']);
    Route::put('/admin/perkaderans/{id}', [PerkaderanController::class, 'update']);
    Route::delete('/admin/perkaderans/{id}', [PerkaderanController::class, 'destroy']);

    // Admin - Monitoring Presensi & Nilai
    Route::get('/admin/attendances', [AdminAttendanceController::class, 'index']);
    Route::get('/admin/attendances/recap', [AdminAttendanceController::class, 'getMonthlyRecap']);
    Route::get('/admin/attendances/sessions', [AdminAttendanceController::class, 'getSessions']);
    Route::get('/admin/attendances/export', [AdminAttendanceController::class, 'export']);

    // Mentor - Manajemen Perkaderan
    Route::get('/mentor/perkaderan/dashboard', [PerkaderanMentorController::class, 'getDashboard']);
    Route::get('/mentor/perkaderan/presensi-setup', [PerkaderanMentorController::class, 'getPresensiSetup']);
    Route::post('/mentor/perkaderan/attendance', [PerkaderanMentorController::class, 'storePresensi']);
    Route::get('/mentor/perkaderan/history', [PerkaderanMentorController::class, 'getHistory']);
    Route::delete('/mentor/perkaderan/attendance', [PerkaderanMentorController::class, 'destroySession']);
    Route::get('/mentor/perkaderan/assessments', [PerkaderanMentorController::class, 'getPenilaian']);
    Route::post('/mentor/perkaderan/assessments', [PerkaderanMentorController::class, 'storePenilaian']);

    Route::get('/admin/assessments', [AdminAssessmentController::class, 'index']);
    Route::get('/admin/assessments/export', [AdminAssessmentController::class, 'export']);
    Route::get('/admin/assessments/status', [AdminAssessmentController::class, 'statusMonitoring']);

    // Rute Monitoring Perkaderan untuk Admin
    Route::get('/admin/perkaderan/monitoring', [AdminPerkaderanMonitorController::class, 'index']);

    // Admin - CMS & Website Profile
    Route::get('/admin/news', [NewsController::class, 'index']);
    Route::post('/admin/news', [NewsController::class, 'store']);
    Route::get('/admin/news/{id}', [NewsController::class, 'show']);
    Route::post('/admin/news/{id}', [NewsController::class, 'update']);
    Route::delete('/admin/news/{id}', [NewsController::class, 'destroy']);

    Route::get('/admin/galleries', [GalleryController::class, 'index']);
    Route::post('/admin/galleries', [GalleryController::class, 'store']);
    Route::delete('/admin/galleries/{id}', [GalleryController::class, 'destroy']);

    Route::get('/admin/company-profile', [CompanyProfileController::class, 'show']);
    Route::put('/admin/company-profile', [CompanyProfileController::class, 'update']);

    // Admin - Manajemen Prestasi
    Route::get('/admin/achievements', [AchievementController::class, 'index']);
    Route::post('/admin/achievements', [AchievementController::class, 'store']);
    Route::put('/admin/achievements/{id}', [AchievementController::class, 'update']);
    Route::delete('/admin/achievements/{id}', [AchievementController::class, 'destroy']);
    Route::get('/admin/students-list', [StudentController::class, 'getStudentList']);


    // =====================================================================
    // ROUTES KHUSUS MENTOR / PEMBINA EKSKUL
    // =====================================================================
    Route::get('/mentor/dashboard', [AttendanceController::class, 'getDashboard']);
    Route::post('/mentor/students', [StudentController::class, 'storeByMentor']); 
    
    // Mentor - Manajemen Presensi
    Route::get('/mentor/presensi-setup', [AttendanceController::class, 'getPresensiSetup']);
    Route::post('/mentor/attendance', [AttendanceController::class, 'store']);
    Route::get('/mentor/attendances/recap', [AttendanceController::class, 'getRecap']);
    Route::delete('/mentor/attendance', [AttendanceController::class, 'destroySession']);
    Route::get('/mentor/history', [AttendanceController::class, 'getHistory']);
    Route::get('/mentor/presensi-edit', [AttendanceController::class, 'getPresensiEdit']);

    // Mentor - Manajemen Penilaian
    Route::get('/mentor/assessments', [AssessmentController::class, 'index']);
    Route::get('/mentor/assessments/template', [AssessmentController::class, 'downloadTemplate']);
    Route::post('/mentor/assessments/import', [AssessmentController::class, 'importExcel']);
    Route::put('/mentor/assessments/{id}', [AssessmentController::class, 'update']);
    Route::delete('/mentor/assessments/{id}', [AssessmentController::class, 'destroy']);


    // =====================================================================
    // ROUTES KHUSUS WALI SANTRI
    // =====================================================================
    Route::get('/wali/dashboard', [App\Http\Controllers\WaliController::class, 'dashboard']);
    Route::get('/wali/attendances', [App\Http\Controllers\WaliController::class, 'attendances']);
    Route::get('/wali/assessments', [App\Http\Controllers\WaliController::class, 'assessments']);

});