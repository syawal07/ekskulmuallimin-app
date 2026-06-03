import { cookies } from "next/headers"
import { WaliDashboardClient } from "@/components/wali/wali-dashboard-client"

// Menghindari caching agresif dari Next.js agar data presensi selalu realtime
export const dynamic = "force-dynamic" 

async function getWaliData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    };

    // Melakukan fetch ke 3 endpoint API secara paralel agar lebih cepat
    const [dashboardRes, attendanceRes, assessmentRes] = await Promise.all([
      fetch(`${apiUrl}/wali/dashboard`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/wali/attendances`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/wali/assessments`, { headers, cache: 'no-store' })
    ]);

    if (!dashboardRes.ok) return null;

    const dashboardJson = await dashboardRes.json();
    const attendanceJson = attendanceRes.ok ? await attendanceRes.json() : { data: [] };
    const assessmentJson = assessmentRes.ok ? await assessmentRes.json() : { data: [] };

    return {
      student: dashboardJson.data.student,
      excul: dashboardJson.data.excul,
      attendances: attendanceJson.data,
      assessments: assessmentJson.data
    };

  } catch (error) {
    console.error("Gagal menarik data wali:", error);
    return null;
  }
}

export default async function WaliDashboardPage() {
  const data = await getWaliData();

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-bold">
          Gagal memuat data. Sesi mungkin telah berakhir, silakan login ulang.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Dashboard Wali Santri</h1>
        <p className="text-slate-500 mt-2">
          Pantau presensi dan perkembangan ekstrakurikuler putra/putri Anda.
        </p>
      </div>

      <WaliDashboardClient 
        student={data.student}
        excul={data.excul}
        attendances={data.attendances}
        assessments={data.assessments}
      />
    </div>
  )
}