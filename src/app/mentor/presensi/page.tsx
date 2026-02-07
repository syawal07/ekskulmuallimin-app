import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AttendanceForm from "@/components/mentor/attendance-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"

export default async function PresensiPage({
  searchParams,
}: {
  searchParams: Promise<{ exculId?: string }>
}) {
  const params = await searchParams
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) redirect("/login")

  // 1. Ambil daftar ekskul guru ini
  const mentor = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      mentoringExculs: true
    }
  })

  const exculs = mentor?.mentoringExculs || []

  // KASUS A: Guru tidak punya ekskul
  if (exculs.length === 0) {
    return <div className="p-8 text-center text-slate-500">Anda belum ditugaskan mengampu ekskul apapun.</div>
  }

  // KASUS B & C: Logika pemilihan ekskul
  let selectedExculId = params.exculId

  // Jika cuma 1, paksa pilih itu
  if (exculs.length === 1) {
    selectedExculId = exculs[0].id
  }

  // JIKA BELUM MEMILIH EKSKUL (Tampilkan Pilihan)
  if (!selectedExculId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pilih Kelas Ekskul</h1>
          <p className="text-slate-600">Silakan pilih kelas yang ingin Anda presensi hari ini.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exculs.map((ex) => (
            <Card key={ex.id} className="hover:border-primary hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{ex.name}</h3>
                  {/* BAGIAN LOKASI DIHAPUS AGAR BERSIH */}
                </div>
                <Link href={`/mentor/presensi?exculId=${ex.id}`} className="w-full">
                  <Button className="w-full" variant="outline">Pilih Kelas <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // JIKA SUDAH MEMILIH EKSKUL -> TAMPILKAN FORM
  const selectedExcul = exculs.find(e => e.id === selectedExculId)
  
  // Ambil Siswa di ekskul tersebut
  const students = await prisma.student.findMany({
    where: { exculId: selectedExculId, isActive: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Input Presensi</h1>
          <p className="text-slate-600">Catat kehadiran santri secara real-time.</p>
        </div>
        {exculs.length > 1 && (
          <Link href="/mentor/presensi">
            <Button variant="outline" size="sm">Ganti Kelas</Button>
          </Link>
        )}
      </div>

      <AttendanceForm 
        students={students} 
        exculId={selectedExculId} 
        // 👇 PERBAIKAN: Hanya kirim nama ekskul saja (tanpa lokasi)
        exculName={selectedExcul?.name || ""}
      />
    </div>
  )
}