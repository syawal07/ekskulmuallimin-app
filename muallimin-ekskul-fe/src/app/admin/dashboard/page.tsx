import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Trophy, School } from "lucide-react"
import { getToken } from "@/lib/session"

export const dynamic = "force-dynamic"

interface DashboardStats {
  totalSiswa: number;
  totalGuru: number;
  totalEkskul: number;
  presensiHariIni: number;
}

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    
    if (!apiUrl || !token) return null;

    const res = await fetch(`${apiUrl}/admin/dashboard-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;

    const result = await res.json();
    return result.data as DashboardStats;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const totalSiswa = stats?.totalSiswa ?? 0;
  const totalGuru = stats?.totalGuru ?? 0;
  const totalEkskul = stats?.totalEkskul ?? 0;
  const presensiHariIni = stats?.presensiHariIni ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Administrator</h1>
        <p className="text-slate-600 mt-2">Gambaran umum statistik ekstrakurikuler sekolah.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Siswa</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalSiswa}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Guru</CardTitle>
            <UserCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalGuru}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Ekskul</CardTitle>
            <Trophy className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEkskul}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Presensi Hari Ini</CardTitle>
            <School className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{presensiHariIni}</div>
          </CardContent>
        </Card>
      </div>

      <div className="p-10 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50">
        <p className="text-slate-400 font-medium">
          Selamat datang di Panel Admin. Silakan pilih menu di samping untuk mengelola data.
        </p>
      </div>
    </div>
  )
}