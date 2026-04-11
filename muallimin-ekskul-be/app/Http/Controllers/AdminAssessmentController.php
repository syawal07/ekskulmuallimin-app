<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assessment;
use App\Models\Excul;
use App\Exports\AssessmentReportExport;
use Maatwebsite\Excel\Facades\Excel;

class AdminAssessmentController extends Controller
{
    public function index(Request $request)
    {
        $exculId = $request->query('excul_id');

        $query = Assessment::with(['student', 'excul', 'mentor']);

        if ($exculId) {
            $query->where('excul_id', $exculId);
        }

        $assessments = $query->get()->sortBy('student.name')->values();

        return response()->json([
            'success' => true,
            'data' => $assessments
        ], 200);
    }

    public function export(Request $request)
    {
        $exculId = $request->query('excul_id');
        
        if (!$exculId) {
            return response()->json(['message' => 'Pilih ekstrakurikuler terlebih dahulu'], 400);
        }

        $excul = Excul::find($exculId);
        $fileName = 'Laporan_Nilai_' . ($excul ? str_replace(' ', '_', $excul->name) : 'Ekskul') . '.xlsx';

        return Excel::download(new AssessmentReportExport($exculId), $fileName);
    }
}