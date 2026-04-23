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

Route::post('/login', [AuthController::class, 'login']);
Route::get('/landing', [LandingController::class, 'index']);
Route::get('/public/news', [NewsController::class, 'publicIndex']);
Route::get('/public/news/{slug}', [NewsController::class, 'publicShow']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/admin/dashboard-stats', [DashboardController::class, 'adminStats']);

    Route::get('/admin/exculs', [ExculController::class, 'index']);
    Route::post('/admin/exculs', [ExculController::class, 'store']);
    Route::put('/admin/exculs/{id}', [ExculController::class, 'update']);
    Route::delete('/admin/exculs/{id}', [ExculController::class, 'destroy']);

    Route::get('/admin/students', [StudentController::class, 'index']);
    Route::post('/admin/students', [StudentController::class, 'store']);
    Route::post('/admin/students/import', [StudentController::class, 'import']);
    Route::get('/admin/students/{id}', [StudentController::class, 'show']);
    Route::put('/admin/students/{id}', [StudentController::class, 'update']);
    Route::delete('/admin/students/{id}', [StudentController::class, 'destroy']);
    Route::post('/mentor/students', [StudentController::class, 'storeByMentor']);

    Route::get('/admin/mentors', [MentorController::class, 'index']);
    Route::post('/admin/mentors', [MentorController::class, 'store']);
    Route::get('/admin/mentors/{id}', [MentorController::class, 'show']);
    Route::put('/admin/mentors/{id}', [MentorController::class, 'update']);
    Route::delete('/admin/mentors/{id}', [MentorController::class, 'destroy']);

    Route::get('/admin/attendances', [AdminAttendanceController::class, 'index']);
    Route::get('/admin/attendances/recap', [AdminAttendanceController::class, 'getMonthlyRecap']);
    Route::get('/admin/attendances/sessions', [AdminAttendanceController::class, 'getSessions']);
    Route::get('/admin/attendances/export', [AdminAttendanceController::class, 'export']);

    Route::get('/admin/assessments', [AdminAssessmentController::class, 'index']);
    Route::get('/admin/assessments/export', [AdminAssessmentController::class, 'export']);

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

    Route::get('/mentor/assessments', [AssessmentController::class, 'index']);
    Route::get('/mentor/assessments/template', [AssessmentController::class, 'downloadTemplate']);
    Route::post('/mentor/assessments/import', [AssessmentController::class, 'importExcel']);
    Route::put('/mentor/assessments/{id}', [AssessmentController::class, 'update']);
    Route::delete('/mentor/assessments/{id}', [AssessmentController::class, 'destroy']);

    Route::get('/mentor/dashboard', [AttendanceController::class, 'getDashboard']);
    Route::get('/mentor/presensi-setup', [AttendanceController::class, 'getPresensiSetup']);
    Route::post('/mentor/attendance', [AttendanceController::class, 'store']);
    Route::get('/mentor/attendances/recap', [AttendanceController::class, 'getRecap']);
    Route::delete('/mentor/attendance', [AttendanceController::class, 'destroySession']);
    Route::get('/mentor/history', [AttendanceController::class, 'getHistory']);
    Route::get('/mentor/presensi-edit', [AttendanceController::class, 'getPresensiEdit']);
});