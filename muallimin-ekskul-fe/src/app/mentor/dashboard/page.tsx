import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy, CalendarCheck, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic" 

interface ClassItem {
  id: string | number;
  name: string;
  location: string;
  students_count: number;
  type: 'EKSKUL' | 'PERKADERAN';
}

interface MergedDashboardData {
  mentor_name: string;
  total_classes: number;
  total_students: number;
  attendance_today: number;
  classes: ClassItem[];
}

interface ExculResponse {
  id: string | number;
  name: string;
  location?: string;
  students_count?: number;
}

interface PerkaderanResponse {
  id: string | number;
  nama_jenjang: string;
  target_kelas?: string;
}

async function getDashboardData(): Promise<MergedDashboardData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

    if (!token || !apiUrl) return null;

    const [resExcul, resPerkaderan] = await Promise.allSettled([
      fetch(`${apiUrl}/mentor/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        cache: 'no-store'
      }),
      fetch(`${apiUrl}/mentor/perkaderan/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        cache: 'no-store'
      })
    ]);

    const exculData = resExcul.status === 'fulfilled' && resExcul.value.ok ? await resExcul.value.json() : null;
    const perkaderanData = resPerkaderan.status === 'fulfilled' && resPerkaderan.value.ok ? await resPerkaderan.value.json() : null;

    if (!exculData?.data && !perkaderanData?.data) return null;

    const mentor_name = exculData?.data?.mentor_name || perkaderanData?.data?.mentor_name || 'Mentor';
    const total_exculs = exculData?.data?.total_exculs || 0;
    const total_perkaderans = perkaderanData?.data?.total_perkaderans || 0;
    const excul_students = exculData?.data?.total_students || 0;
    const perkaderan_students = perkaderanData?.data?.total_students || 0;
    const excul_attendance = exculData?.data?.attendance_today || 0;
    const perkaderan_attendance = perkaderanData?.data?.attendance_today || 0;

    let classes: ClassItem[] = [];

    if (exculData?.data?.exculs) {
      const mappedExculs = exculData.data.exculs.map((ex: ExculResponse) => ({
        id: ex.id,
        name: ex.name,
        location: ex.location || '-',
        students_count: ex.students_count || 0,
        type: 'EKSKUL'
      }));
      classes = [...classes, ...mappedExculs];
    }

    if (perkaderanData?.data?.perkaderans) {
      const mappedPerkaderans = perkaderanData.data.perkaderans.map((pk: PerkaderanResponse) => ({
        id: pk.id,
        name: pk.nama_jenjang,
        location: pk.target_kelas || '-',
        students_count: 0,
        type: 'PERKADERAN'
      }));
      classes = [...classes, ...mappedPerkaderans];
    }

    return {
      mentor_name,
      total_classes: total_exculs + total_perkaderans,
      total_students: excul_students + perkaderan_students,
      attendance_today: excul_attendance + perkaderan_attendance,
      classes
    };
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
          Berikut ringkasan aktivitas pengajaran Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Kelas Diampu
            </CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.total_classes}</div>
            <p className="text-xs text-slate-500 mt-1">Ekskul dan Perkaderan</p>
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
            {data.classes.length > 0 ? (
              <div className="space-y-4">
                {data.classes.map((cls, idx) => (
                  <div key={`${cls.id}-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full border border-slate-200">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {cls.name} <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full">{cls.type}</span>
                        </p>
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">
                          {cls.type === 'EKSKUL' ? `Kampus ${cls.location}` : `Target: ${cls.location}`}
                        </p>
                      </div>
                    </div>
                    <Link href={cls.type === 'EKSKUL' ? `/mentor/presensi?exculId=${cls.id}` : `/mentor/perkaderan/presensi?perkaderanId=${cls.id}`}>
                      <Button size="sm" variant="outline">Detail</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                Belum ada kegiatan yang ditugaskan.
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
            
            <div className="flex gap-2">
                <Link href="/mentor/presensi" className="w-full">
                <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold shadow">
                    Presensi Ekskul
                </Button>
                </Link>
                <Link href="/mentor/perkaderan/presensi" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-black/20">
                    Presensi Perkaderan <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}