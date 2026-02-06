import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy, CalendarCheck, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

export default async function MentorDashboard() {
  // 1. Ambil ID Guru yang sedang login
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) return null

  // 2. Ambil Data Real dari Database
  // Kita cari guru ini pegang ekskul apa saja & hitung siswanya
  const mentorData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      mentoringExculs: {
        include: {
          _count: {
            select: { students: true }
          }
        }
      }
    }
  })

  // 3. Hitung Statistik Sederhana
  const exculs = mentorData?.mentoringExculs || []
  const totalEkskul = exculs.length
  // Menjumlahkan semua siswa dari semua ekskul yang diampu
  const totalSiswa = exculs.reduce((acc, curr) => acc + curr._count.students, 0)
  
  // Cek apakah hari ini sudah ada presensi? (Opsional, logika sederhana dulu)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const attendanceToday = await prisma.attendance.count({
    where: {
      recorderId: userId,
      date: {
        gte: today
      }
    }
  })

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Pengajar</h1>
        <p className="text-slate-600 mt-2">
          Assalamu&apos;alaikum, <span className="font-bold text-primary">{mentorData?.name}</span>. 
          Berikut ringkasan aktivitas ekstrakurikuler Anda.
        </p>
      </div>

      {/* STATISTIK CARDS (Mengisi Ruang Putih) */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* KARTU 1: TOTAL EKSKUL */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Ekskul Diampu
            </CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEkskul}</div>
            <p className="text-xs text-slate-500 mt-1">
              Cabang ekstrakurikuler
            </p>
          </CardContent>
        </Card>

        {/* KARTU 2: TOTAL SISWA */}
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Siswa Binaaan
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalSiswa}</div>
            <p className="text-xs text-slate-500 mt-1">
              Santri aktif terdaftar
            </p>
          </CardContent>
        </Card>

        {/* KARTU 3: STATUS HARI INI */}
        <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${attendanceToday > 0 ? 'border-l-green-500' : 'border-l-orange-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Aktivitas Hari Ini
            </CardTitle>
            <CalendarCheck className={`h-4 w-4 ${attendanceToday > 0 ? 'text-green-500' : 'text-orange-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {attendanceToday > 0 ? "Sudah Presensi" : "Belum Ada"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {attendanceToday > 0 ? "Data tersimpan aman" : "Silakan input presensi"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DAFTAR EKSKUL & AKSI CEPAT */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Kolom Kiri: Daftar Ekskul */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Daftar Kelas Anda</CardTitle>
          </CardHeader>
          <CardContent>
            {exculs.length > 0 ? (
              <div className="space-y-4">
                {exculs.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full border border-slate-200">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{ex.name}</p>
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                          Kampus {ex.location} • {ex._count.students} Siswa
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

        {/* Kolom Kanan: Jadwal / Info (Placeholder Cerdas) */}
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