import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Trophy, ChevronRight, ImageIcon } from "lucide-react"
import Link from "next/link"
import FilterDate from "@/components/mentor/filter-date"

export const dynamic = "force-dynamic"

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) redirect("/login")

  // FILTER LOGIC
  const now = new Date()
  const selectedMonth = params.month ? parseInt(params.month) : now.getMonth() + 1
  const selectedYear = params.year ? parseInt(params.year) : now.getFullYear()

  // Range Tanggal
  const startDate = new Date(selectedYear, selectedMonth - 1, 1)
  const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59)

  // 1. AMBIL DATA PRESENSI
  const rawAttendances = await prisma.attendance.findMany({
    where: { 
      recorderId: userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      student: { include: { excul: true } }
    },
    orderBy: { date: 'desc' }
  })

  // 2. LOGIKA GROUPING
  type SessionGroup = {
    date: Date
    exculId: string
    exculName: string
    // HAPUS field 'campus' agar tidak ada potensi muncul di UI
    totalStudent: number
    hasProof: boolean 
    stats: { HADIR: number; SAKIT: number; IZIN: number; ALPHA: number }
  }

  const sessions: Record<string, SessionGroup> = {}

  rawAttendances.forEach((record) => {
    const dateStr = record.date.toISOString().substring(0, 10)
    const exculId = record.student.exculId
    const key = `${dateStr}-${exculId}`

    if (!sessions[key]) {
      sessions[key] = {
        date: record.date,
        exculId: exculId,
        // Pastikan hanya ambil Nama, tanpa lokasi
        exculName: record.student.excul.name, 
        totalStudent: 0,
        hasProof: false,
        stats: { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 }
      }
    }

    sessions[key].totalStudent += 1
    if (record.proofImageUrl) sessions[key].hasProof = true
    
    if (sessions[key].stats[record.status] !== undefined) {
       sessions[key].stats[record.status] += 1
    }
  })

  const sessionList = Object.values(sessions)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Riwayat Aktivitas</h1>
        <p className="text-slate-600 mt-2">
          Rekapitulasi kegiatan presensi bulanan.
        </p>
      </div>

      {/* KOMPONEN FILTER */}
      <FilterDate />

      {sessionList.length > 0 ? (
        <div className="grid gap-4">
          {sessionList.map((session, index) => {
             const dateStr = session.date.toISOString().substring(0, 10)
             const editUrl = `/mentor/riwayat/${dateStr}/${session.exculId}`

             return (
              <Link key={index} href={editUrl} className="block group">
                <Card className="hover:shadow-lg transition-all border-slate-200 bg-white group-hover:border-primary/50 cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      {/* INFO */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 group-hover:text-primary transition-colors">
                            {new Date(session.date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                            {/* HANYA MENAMPILKAN NAMA EKSKUL */}
                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                              <Trophy className="w-3 h-3" /> {session.exculName}
                            </span>
                            {session.hasProof && (
                              <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium border border-green-100">
                                <ImageIcon className="w-3 h-3" /> Ada Foto
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* STATISTIK */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center px-3 py-1 bg-green-50 rounded border border-green-100 min-w-[50px]">
                          <span className="text-[10px] font-bold text-green-600">HDR</span>
                          <span className="text-base font-bold text-green-700">{session.stats.HADIR}</span>
                        </div>
                        {session.stats.SAKIT > 0 && (
                          <div className="flex flex-col items-center px-3 py-1 bg-blue-50 rounded border border-blue-100 min-w-[50px]">
                            <span className="text-[10px] font-bold text-blue-600">SKT</span>
                            <span className="text-base font-bold text-blue-700">{session.stats.SAKIT}</span>
                          </div>
                        )}
                        {session.stats.IZIN > 0 && (
                          <div className="flex flex-col items-center px-3 py-1 bg-yellow-50 rounded border border-yellow-100 min-w-[50px]">
                            <span className="text-[10px] font-bold text-yellow-600">IZN</span>
                            <span className="text-base font-bold text-yellow-700">{session.stats.IZIN}</span>
                          </div>
                        )}
                        {session.stats.ALPHA > 0 && (
                          <div className="flex flex-col items-center px-3 py-1 bg-red-50 rounded border border-red-100 min-w-[50px]">
                            <span className="text-[10px] font-bold text-red-600">ALP</span>
                            <span className="text-base font-bold text-red-700">{session.stats.ALPHA}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </Link>
             )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-500">Tidak ada data presensi pada bulan ini.</p>
        </div>
      )}
    </div>
  )
}