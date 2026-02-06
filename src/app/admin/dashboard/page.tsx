import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Trophy, School } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  // Hitung Statistik Sekolah
  const totalSiswa = await prisma.student.count({ where: { isActive: true } })
  const totalGuru = await prisma.user.count({ where: { role: 'MENTOR' } })
  const totalEkskul = await prisma.excul.count()
  
  // Hitung presensi hari ini
  const today = new Date()
  today.setHours(0,0,0,0)
  const presensiHariIni = await prisma.attendance.count({
    where: { date: { gte: today } }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Administrator</h1>
        <p className="text-slate-600 mt-2">Gambaran umum statistik ekstrakurikuler sekolah.</p>
      </div>

      {/* Grid Statistik */}
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

      {/* Info Kosong */}
      <div className="p-10 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50">
        <p className="text-slate-400 font-medium">
          Selamat datang di Panel Admin. Silakan pilih menu di samping untuk mengelola data.
        </p>
      </div>
    </div>
  )
}