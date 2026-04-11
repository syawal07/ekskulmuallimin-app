<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exports\AssessmentTemplateExport;
use App\Imports\AssessmentImport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class AssessmentController extends Controller
{
    public function downloadTemplate(Request $request)
    {
        $exculId = $request->query('excul_id');

        if (!$exculId) {
            return response()->json(['success' => false, 'message' => 'Excul ID required'], 400);
        }

        $fileName = 'Template_Nilai_Ekskul_' . time() . '.xlsx';
        
        return Excel::download(new AssessmentTemplateExport($exculId), $fileName);
    }

   public function importExcel(Request $request)
    {
        $request->validate([
            'excul_id' => 'required|uuid',
            'file' => 'required|mimes:xlsx,xls'
        ]);

        $academicYear = $this->getCurrentAcademicYear();

        $import = new AssessmentImport($request->excul_id, $request->user()->id, $academicYear);
        Excel::import($import, $request->file('file'));

        return response()->json([
            'success' => true,
            // INOVASI: Mengembalikan laporan statistik
            'message' => "Berhasil! {$import->updated} nilai diperbarui, {$import->inserted} siswa baru ditambahkan, dan {$import->failed} baris dilewati."
        ], 200);
    }

    private function getCurrentAcademicYear()
    {
        $now = Carbon::now();
        $year = $now->year;

        if ($now->month >= 7) {
            return $year . '/' . ($year + 1);
        }

        return ($year - 1) . '/' . $year;
    }

   public function index(Request $request)
    {
        $exculId = $request->query('excul_id');
        
        $query = \App\Models\Assessment::with('student')
            ->where('mentor_id', $request->user()->id);

        if ($exculId) {
            $query->where('excul_id', $exculId);
        }

        $assessments = $query->get()->sortBy('student.name')->values();

        // INOVASI: Deteksi Siswa Tertinggal (Belum Dinilai)
        $missingQuery = \App\Models\Student::where('is_active', true);
        if ($exculId) {
            $missingQuery->where('excul_id', $exculId);
        }
        $assessedStudentIds = $assessments->pluck('student_id')->toArray();
        $missingStudents = $missingQuery->whereNotIn('id', $assessedStudentIds)
            ->orderBy('name')
            ->get(['id', 'name', 'class']); // Ambil field yang diperlukan saja

        return response()->json([
            'success' => true,
            'data' => [
                'assessments' => $assessments,
                'missing_students' => $missingStudents
            ]
        ], 200);
    }

    // Edit Nilai Satuan
    public function update(Request $request, $id)
    {
        $request->validate(['score' => 'required|integer|min:0|max:100']);
        
        $assessment = \App\Models\Assessment::where('id', $id)
            ->where('mentor_id', $request->user()->id)
            ->firstOrFail();

        $details = \App\Models\Assessment::calculateGradeDetails($request->score);

        $assessment->update([
            'score' => $request->score,
            'predicate' => $details['predicate'],
            'bloom_level' => $details['bloom_level'],
            'description' => $details['description']
        ]);

        return response()->json(['success' => true, 'message' => 'Nilai berhasil diperbarui']);
    }

    // Hapus Nilai Satuan
    public function destroy(Request $request, $id)
    {
        $assessment = \App\Models\Assessment::where('id', $id)
            ->where('mentor_id', $request->user()->id)
            ->firstOrFail();
            
        $assessment->delete();

        return response()->json(['success' => true, 'message' => 'Data nilai dihapus']);
    }
    
}