import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy, CalendarCheck, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic" 

interface DashboardData {
  mentor_name: string;
  total_exculs: number;
  total_students: number;
  attendance_today: number;
  exculs: {
    id: string;
    name: string;
    location: string;
    students_count: number;
  }[];
}

async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

    if (!token || !apiUrl) return null;

    const res = await fetch(`${apiUrl}/mentor/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const result = await res.json();
    return result.data as DashboardData;
  } catch (e) {
    return null;
  }
}

export default async function MentorDashboard() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login") 
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Pengajar</h1>
        <p className="text-slate-600 mt-2">
          Assalamu&apos;alaikum, <span className="font-bold text-primary">{data.mentor_name}</span>. 
          Berikut ringkasan aktivitas ekstrakurikuler Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Ekskul Diampu
            </CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.total_exculs}</div>
            <p className="text-xs text-slate-500 mt-1">Cabang ekstrakurikuler</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Siswa Binaan
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.total_students}</div>
            <p className="text-xs text-slate-500 mt-1">Santri aktif terdaftar</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${data.attendance_today > 0 ? 'border-l-green-500' : 'border-l-orange-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Aktivitas Hari Ini
            </CardTitle>
            <CalendarCheck className={`h-4 w-4 ${data.attendance_today > 0 ? 'text-green-500' : 'text-orange-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data.attendance_today > 0 ? "Sudah Presensi" : "Belum Ada"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data.attendance_today > 0 ? "Data tersimpan aman" : "Silakan input presensi"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Daftar Kelas Anda</CardTitle>
          </CardHeader>
          <CardContent>
            {data.exculs.length > 0 ? (
              <div className="space-y-4">
                {data.exculs.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full border border-slate-200">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{ex.name}</p>
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                          Kampus {ex.location} • {ex.students_count} Siswa
                        </p>
                      </div>
                    </div>
                    <Link href={`/mentor/presensi?exculId=${ex.id}`}>
                      <Button size="sm" variant="outline">Detail</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                Belum ada ekskul yang ditugaskan.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Clock className="w-5 h-5" /> Jadwal Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-slate-300 mb-1">Pengingat</p>
              <h3 className="font-bold text-xl">Jangan Lupa Presensi!</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Pastikan mencatat kehadiran santri setiap pertemuan untuk rekapitulasi nilai rapor di akhir semester.
              </p>
            </div>
            
            <Link href="/mentor/presensi" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-black/20">
                Mulai Presensi Sekarang <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}