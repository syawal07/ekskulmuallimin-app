import { cookies } from "next/headers"
import { WaliDashboardClient } from "@/components/wali/wali-dashboard-client"

export const dynamic = "force-dynamic" 

interface RawAttendance {
  id?: number | string
  status: string
  date?: string
  tanggal?: string
}

interface RawAssessment {
  id?: number | string
  score: string
  evaluation_date?: string
  created_at?: string
  description?: string
  catatan?: string
}

async function getWaliData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { error: "Token sesi tidak ditemukan di cookies browser." };

  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    };

    const dashboardRes = await fetch(`${apiUrl}/wali/dashboard`, { headers, cache: 'no-store' });

    if (!dashboardRes.ok) {
      const errText = await dashboardRes.text();
      return { error: `Backend Error (Status: ${dashboardRes.status}): ${errText}` };
    }

    const attendanceRes = await fetch(`${apiUrl}/wali/attendances`, { headers, cache: 'no-store' });
    const assessmentRes = await fetch(`${apiUrl}/wali/assessments`, { headers, cache: 'no-store' });

    const dashboardJson = await dashboardRes.json();
    const attendanceJson = attendanceRes.ok ? await attendanceRes.json() : { data: [] };
    const assessmentJson = assessmentRes.ok ? await assessmentRes.json() : { data: [] };

    return {
      data: {
        student: dashboardJson.data.student,
        excul: dashboardJson.data.excul,
        attendances: attendanceJson.data,
        assessments: assessmentJson.data
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { error: `Fetch API Gagal: ${errorMessage}` };
  }
}

export default async function WaliDashboardPage() {
  const result = await getWaliData();

  if (result?.error || !result?.data) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border-2 border-red-200 shadow-sm">
          <h2 className="font-black text-xl mb-2 flex items-center gap-2">⚠️ Gagal Memuat Data Server</h2>
          <p className="font-medium text-red-800 mb-4">Sistem gagal menarik data dari Backend. Berikut adalah detail log error-nya:</p>
          
          <div className="bg-red-950 p-4 rounded-xl font-mono text-sm text-red-200 overflow-auto whitespace-pre-wrap">
            {result?.error || "Unknown Error Occurred"}
          </div>
          
          <p className="mt-5 text-sm font-bold text-red-700 bg-red-100/50 p-3 rounded-lg inline-block">
            Langkah Perbaikan: <br/>
            1. Jika statusnya <b>401 Unauthenticated</b>, silakan Logout dan Login kembali.<br/>
            2. Jika statusnya <b>500</b>, periksa console terminal Laravel Anda.
          </p>
        </div>
      </div>
    );
  }

  const data = result.data;
  const activities = [];
  
  if (data.excul) {
    const total = (data.attendances || []).length;
    const present = (data.attendances || []).filter((a: RawAttendance) => a.status.toLowerCase() === 'hadir').length;
    const pct = total === 0 ? 0 : Math.round((present / total) * 100);
    
    const latestScore = data.assessments && data.assessments.length > 0 
      ? data.assessments[data.assessments.length - 1].score 
      : "-";

    activities.push({
      id: data.excul.id,
      name: data.excul.name,
      type: 'Ekskul' as const,
      attendance_percentage: pct,
      score: latestScore
    });
  }

  const mappedAttendances = (data.attendances || []).map((a: RawAttendance, index: number) => ({
    id: a.id?.toString() || `attendance-${index}`,
    activity_name: data.excul?.name || 'Ekstrakurikuler',
    type: 'Ekskul' as const,
    date: a.date || a.tanggal || new Date().toISOString(),
    status: a.status
  }));

  const mappedAssessments = (data.assessments || []).map((a: RawAssessment, index: number) => ({
    id: a.id?.toString() || `assessment-${index}`,
    activity_name: data.excul?.name || 'Ekstrakurikuler',
    type: 'Ekskul' as const,
    evaluation_date: a.evaluation_date || a.created_at || new Date().toISOString(),
    score: a.score,
    description: a.description || a.catatan || ""
  }));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Dashboard Wali Santri</h1>
        <p className="text-slate-500 mt-2">
          Pantau presensi dan perkembangan ekstrakurikuler serta perkaderan putra/putri Anda.
        </p>
      </div>

      <WaliDashboardClient 
        student={data.student}
        activities={activities}
        attendances={mappedAttendances}
        assessments={mappedAssessments}
      />
    </div>
  )
}