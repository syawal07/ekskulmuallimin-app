import { cookies } from "next/headers"
import WaliDashboardClient from "@/components/wali/wali-dashboard-client"

export const dynamic = "force-dynamic" 

async function getWaliData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { error: "Sesi Anda telah berakhir, silakan login ulang." };

  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    };

    const dashboardRes = await fetch(`${apiUrl}/wali/dashboard`, { headers, cache: 'no-store' });
    
    if (!dashboardRes.ok) {
      const errData = await dashboardRes.json().catch(() => ({ message: "Gagal memuat API dari Server." }));
      return { error: errData.message || `Error Kode: ${dashboardRes.status}` };
    }

    const profileRes = await fetch(`${apiUrl}/admin/profile`, { headers, cache: 'no-store' });
    const dashboardJson = await dashboardRes.json();
    const profileJson = profileRes.ok ? await profileRes.json() : null;

    return {
      dashboard: dashboardJson.data,
      schoolProfile: profileJson?.data || null
    };

  } catch (error) {
    return { error: "Koneksi ke Server terputus. Pastikan Backend berjalan." };
  }
}

export default async function WaliDashboardPage() {
  const data = await getWaliData();

  if (data?.error) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-red-500/5 backdrop-blur-xl text-red-900 p-6 md:p-8 rounded-[2rem] border border-red-500/20 shadow-[0_12px_40px_rgba(239,68,68,0.06)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-xl font-extrabold mb-4 flex items-center gap-3 text-red-700 tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              ⚠️
            </span>
            Perhatian
          </h2>
          <p className="font-semibold text-red-800/90 leading-relaxed md:pl-11">{data.error}</p>
          
          <div className="mt-6 pt-5 border-t border-red-500/10 md:pl-11">
            <div className="bg-white/40 border border-white/60 p-5 rounded-2xl shadow-inner text-sm text-red-700/90 leading-relaxed">
              Tips: Jika data siswa tidak ditemukan, pastikan akun <b className="font-bold text-red-900">Wali Santri</b> memiliki Username (NIS) yang sama persis dengan yang ada di menu <b className="font-bold text-red-900">Data Siswa (Admin)</b>.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="px-1">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Dashboard Wali Santri
        </h1>
        <p className="text-slate-500 mt-2.5 font-medium text-sm md:text-base leading-relaxed max-w-2xl">
          Pantau presensi, evaluasi, dan rekam jejak prestasi putra/putri Anda dengan mudah dalam satu panel terintegrasi.
        </p>
      </div>

      <WaliDashboardClient data={data.dashboard} />
    </div>
  )
}