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
    
    // Jika tidak OK (404 atau 500), tangkap pesan error asli dari Backend!
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
      <div className="p-8 max-w-4xl mx-auto mt-10">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 shadow-sm animate-in fade-in zoom-in duration-300">
          <h2 className="text-xl font-black mb-2 flex items-center gap-2">
            ⚠️ Perhatian
          </h2>
          <p className="font-medium">{data.error}</p>
          <div className="mt-4 pt-4 border-t border-red-200/50">
            <p className="text-sm text-red-600/80">
              Tips: Jika data siswa tidak ditemukan, pastikan akun <b>Wali Santri</b> memiliki Username (NIS) yang sama persis dengan yang ada di menu <b>Data Siswa (Admin)</b>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Dashboard Wali Santri</h1>
        <p className="text-slate-500 mt-2">
          Pantau presensi, evaluasi, dan rekam jejak prestasi putra/putri Anda.
        </p>
      </div>

      <WaliDashboardClient data={data.dashboard} />
    </div>
  )
}