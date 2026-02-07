import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AttendanceForm from "@/components/mentor/attendance-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditAttendancePage({
  params,
}: {
  params: Promise<{ date: string; exculId: string }>
}) {
  const { date, exculId } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) redirect("/login")

  // 1. Ambil Info Ekskul
  const excul = await prisma.excul.findUnique({
    where: { id: exculId }
  })

  if (!excul) return <div>Data tidak ditemukan</div>

  // 2. Ambil Semua Siswa di Ekskul ini (Aktif)
  const students = await prisma.student.findMany({
    where: { exculId: exculId, isActive: true },
    orderBy: { name: 'asc' }
  })

  // 3. Ambil Data Presensi yang SUDAH ADA di tanggal tersebut
  const targetDate = new Date(date)
  const existingAttendance = await prisma.attendance.findMany({
    where: {
      date: targetDate,
      student: { exculId: exculId } // Pastikan hanya ekskul ini
    },
    select: {
      studentId: true,
      status: true,
      notes: true,
      proofImageUrl: true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mentor/riwayat">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Presensi</h1>
          <p className="text-slate-600">Perbaiki data kehadiran jika ada kesalahan.</p>
        </div>
      </div>

      <AttendanceForm 
        students={students} 
        exculId={exculId} 
        // 👇 PERBAIKAN DI SINI: Hanya kirim nama ekskul saja (tanpa lokasi)
        exculName={excul.name}
        initialDate={date}          // Mengunci tanggal
        initialData={existingAttendance} // Mengisi radio button otomatis
      />
    </div>
  )
}