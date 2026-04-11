import { cookies } from "next/headers"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Filter, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import Link from "next/link"


const getStatusColor = (status: string) => {
  switch (status) {
    case "HADIR": return "bg-green-100 text-green-700 border-green-200"
    case "SAKIT": return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "IZIN": return "bg-blue-100 text-blue-700 border-blue-200"
    case "ALPHA": return "bg-red-100 text-red-700 border-red-200"
    default: return "bg-slate-100 text-slate-700"
  }
}

export const dynamic = "force-dynamic"

interface Excul {
  id: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  status: string;
  notes: string | null;
  proofImageUrl: string | null;
  created_at: string;
  student: {
    name: string;
    class: string;
  }
}

interface MetaData {
  current_page: number;
  last_page: number;
  total: number;
}

async function getAdminPresensiData(date: string, exculId?: string, page: number = 1) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

  if (!token || !apiUrl) return { exculs: [], attendanceData: [], meta: null };

  const exculRes = await fetch(`${apiUrl}/admin/exculs`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    cache: 'no-store'
  });
  const exculs = exculRes.ok ? (await exculRes.json()).data : [];

  let attendanceData: AttendanceRecord[] = [];
  let meta: MetaData | null = null;
  
  if (exculId) {
    const url = `${apiUrl}/admin/attendances?date=${date}&excul_id=${exculId}&page=${page}`;
    const attRes = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (attRes.ok) {
      const result = await attRes.json();
      attendanceData = result.data;
      meta = result.meta;
    }
  }

  return { exculs, attendanceData, meta };
}

export default async function AdminPresensiPage({
  searchParams,
}: {
  searchParams: Promise<{ exculId?: string; date?: string; page?: string }>
}) {
  const params = await searchParams
  const dateFilter = params.date || new Date().toISOString().split('T')[0]
  const exculFilter = params.exculId
  const currentPage = Number(params.page) || 1

  const { exculs, attendanceData, meta } = await getAdminPresensiData(dateFilter, exculFilter, currentPage);

  const sessionProofUrl = attendanceData.find(item => item.proofImageUrl)?.proofImageUrl

  async function filterAction(formData: FormData) {
    "use server"
    const exculId = formData.get("exculId")
    const date = formData.get("date")
    redirect(`/admin/presensi?exculId=${exculId}&date=${date}&page=1`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Monitoring Presensi</h1>
        <p className="text-slate-600">Pantau kehadiran dan dokumentasi kegiatan ekstrakurikuler.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
            <form action={filterAction} className="flex flex-col md:flex-row gap-4 items-end w-full xl:w-auto">
              <div className="space-y-2 w-full md:w-auto">
                <label className="text-sm font-medium text-slate-700">Pilih Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="date"
                    defaultValue={dateFilter}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2 w-full md:w-64">
                <label className="text-sm font-medium text-slate-700">Pilih Ekskul</label>
                <Select name="exculId" defaultValue={exculFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Ekskul --" />
                  </SelectTrigger>
                  <SelectContent>
                    {exculs.map((ex: Excul) => (
                      <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="mb-[2px] gap-2">
                <Filter className="w-4 h-4" /> Tampilkan
              </Button>
            </form>

            {exculFilter && attendanceData.length > 0 && (
              <a href={`/api/export?date=${dateFilter}&exculId=${exculFilter}`}>
                <Button variant="outline" className="mb-[2px] gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800">
                  <Download className="w-4 h-4" /> Export Excel
                </Button>
              </a>
            )}

            {sessionProofUrl && (
              <div className="w-full xl:w-auto flex justify-end">
                <a 
                  href={process.env.NEXT_PUBLIC_API_BACKEND_URL?.replace('/api', '') + sessionProofUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800">
                    <ImageIcon className="w-4 h-4" />
                    Lihat Dokumentasi Sesi
                    <ExternalLink className="w-3 h-3 opacity-50 ml-1" />
                  </Button>
                </a>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu Input</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!exculFilter ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    Silakan pilih <b>Tanggal</b> dan <b>Ekskul</b> terlebih dahulu.
                  </TableCell>
                </TableRow>
              ) : attendanceData.length > 0 ? (
                attendanceData.map((data, index) => (
                  <TableRow key={data.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center text-slate-500">
                      {meta ? (meta.current_page - 1) * 15 + index + 1 : index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">{data.student.name}</TableCell>
                    <TableCell>{data.student.class}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(data.status)}>
                        {data.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm font-mono">
                      {new Date(data.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-medium">Belum ada data presensi.</p>
                      <p className="text-xs text-slate-400">Mentor mungkin belum melakukan input.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 bg-slate-50/30">
              <div className="text-sm text-slate-500">
                Menampilkan halaman <b>{meta.current_page}</b> dari <b>{meta.last_page}</b> (Total: {meta.total} Siswa)
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/presensi?exculId=${exculFilter}&date=${dateFilter}&page=${meta.current_page - 1}`}
                  className={meta.current_page <= 1 ? "pointer-events-none" : ""}
                >
                  <Button variant="outline" size="sm" disabled={meta.current_page <= 1} className="gap-1">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                </Link>
                <Link
                  href={`/admin/presensi?exculId=${exculFilter}&date=${dateFilter}&page=${meta.current_page + 1}`}
                  className={meta.current_page >= meta.last_page ? "pointer-events-none" : ""}
                >
                  <Button variant="outline" size="sm" disabled={meta.current_page >= meta.last_page} className="gap-1">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}