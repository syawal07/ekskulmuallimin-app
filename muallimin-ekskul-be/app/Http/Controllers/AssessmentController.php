<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exports\AssessmentTemplateExport;
use App\Imports\AssessmentImport;
use App\Models\Assessment;
use App\Models\Student;
use App\Models\AcademicYear;
use Maatwebsite\Excel\Facades\Excel;

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

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['success' => false, 'message' => 'Tahun Pelajaran belum diatur'], 400);
        }

        $import = new AssessmentImport($request->excul_id, $request->user()->id, $activeYear->id);
        Excel::import($import, $request->file('file'));

        return response()->json([
            'success' => true,
            'message' => "Berhasil! {$import->updated} nilai diperbarui, {$import->inserted} siswa baru ditambahkan, dan {$import->failed} baris dilewati."
        ], 200);
    }

    public function index(Request $request)
    {
        $exculId = $request->query('excul_id');
        $activeYear = AcademicYear::where('is_active', true)->first();
        
        $query = Assessment::with('student')
            ->where('mentor_id', $request->user()->id);

        if ($activeYear) {
            $query->where('academic_year_id', $activeYear->id);
        }

        if ($exculId) {
            $query->where('excul_id', $exculId);
        }

        $assessments = $query->get()->sortBy('student.name')->values();

        // INOVASI: Optimasi Database Engine (Lebih Ringan dari WHERE NOT IN PHP)
        $missingQuery = Student::where('is_active', true);
        
        if ($exculId && $activeYear) {
            $missingQuery->whereHas('exculs', function($q) use ($exculId, $activeYear) {
                $q->where('excul_student.excul_id', $exculId)
                  ->where('excul_student.academic_year_id', $activeYear->id);
            })->whereDoesntHave('assessments', function($q) use ($exculId, $activeYear) {
                $q->where('excul_id', $exculId)
                  ->where('academic_year_id', $activeYear->id);
            });
        }

        $missingStudents = $missingQuery->orderBy('name')->get(['id', 'name', 'class']);

        return response()->json([
            'success' => true,
            'data' => [
                'assessments' => $assessments,
                'missing_students' => $missingStudents
            ]
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['score' => 'required|integer|min:0|max:100']);
        
        $assessment = Assessment::where('id', $id)
            ->where('mentor_id', $request->user()->id)
            ->firstOrFail();

        $details = Assessment::calculateGradeDetails($request->score);

        $assessment->update([
            'score' => $request->score,
            'predicate' => $details['predicate'],
            'bloom_level' => $details['bloom_level'],
            'description' => $details['description']
        ]);

        return response()->json(['success' => true, 'message' => 'Nilai berhasil diperbarui']);
    }

    public function destroy(Request $request, $id)
    {
        $assessment = Assessment::where('id', $id)
            ->where('mentor_id', $request->user()->id)
            ->firstOrFail();
            
        $assessment->delete();

        return response()->json(['success' => true, 'message' => 'Data nilai dihapus']);
    }
}