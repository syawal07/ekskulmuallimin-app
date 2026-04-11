import { cookies } from "next/headers"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Trophy, ChevronRight, ImageIcon } from "lucide-react"
import Link from "next/link"
import FilterDate from "@/components/mentor/filter-date"

export const dynamic = "force-dynamic"

interface SessionStats {
  HADIR: number;
  SAKIT: number;
  IZIN: number;
  ALPHA: number;
}

interface SessionData {
  date: string;
  exculId: string;
  exculName: string;
  hasProof: boolean;
  stats: SessionStats;
}

async function getHistoryData(month: number, year: number): Promise<SessionData[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

    if (!token || !apiUrl) return [];

    const res = await fetch(`${apiUrl}/mentor/history?month=${month}&year=${year}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) return [];
    const result = await res.json();
    return result.data as SessionData[];
}

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  
  const now = new Date()
  const selectedMonth = params.month ? parseInt(params.month) : now.getMonth() + 1
  const selectedYear = params.year ? parseInt(params.year) : now.getFullYear()

  const sessionList = await getHistoryData(selectedMonth, selectedYear);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Riwayat Aktivitas</h1>
        <p className="text-slate-600 mt-2">
          Rekapitulasi kegiatan presensi bulanan.
        </p>
      </div>

      <FilterDate />

      {sessionList.length > 0 ? (
        <div className="grid gap-4">
          {sessionList.map((session: SessionData, index: number) => {
             const editUrl = `/mentor/riwayat/${session.date}/${session.exculId}`

             return (
              <Link key={index} href={editUrl} className="block group">
                <Card className="hover:shadow-lg transition-all border-slate-200 bg-white group-hover:border-primary/50 cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
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