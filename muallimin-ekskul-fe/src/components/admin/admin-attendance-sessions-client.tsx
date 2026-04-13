'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Filter, Users, CalendarDays, ExternalLink, X, Loader2, Image as ImageIcon, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fetchAttendanceSessions } from "@/actions/attendanceAction"
import * as XLSX from "xlsx"

const getStatusColor = (status: string) => {
  switch (status) {
    case "HADIR": return "bg-green-100 text-green-700 border-green-200"
    case "SAKIT": return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "IZIN": return "bg-blue-100 text-blue-700 border-blue-200"
    case "ALPHA": return "bg-red-100 text-red-700 border-red-200"
    default: return "bg-slate-100 text-slate-700"
  }
}

const getCurrentCutoff = () => {
  const today = new Date()
  const currentDay = today.getDate()
  let start, end;
  
  if (currentDay <= 19) {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 20)
    end = new Date(today.getFullYear(), today.getMonth(), 19)
  } else {
    start = new Date(today.getFullYear(), today.getMonth(), 20)
    end = new Date(today.getFullYear(), today.getMonth() + 1, 19)
  }
  return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }
}

interface Excul { id: string; name: string; }
interface StudentDetail { name: string; class: string; status: string; notes: string | null; }
interface SessionData {
  id: string;
  date: string;
  excul_name: string;
  mentor_name: string;
  proofImageUrl: string | null;
  stats: { HADIR: number; IZIN: number; SAKIT: number; ALPHA: number; };
  students: StudentDetail[];
}

export default function AdminAttendanceSessionsClient({ exculs }: { exculs: Excul[] }) {
  const initialDates = getCurrentCutoff()
  const [startDate, setStartDate] = useState(initialDates.startDate)
  const [endDate, setEndDate] = useState(initialDates.endDate)
  const [selectedExcul, setSelectedExcul] = useState("all")
  
  const [sessionList, setSessionList] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null)

  const setCutoffThisMonth = () => {
    const dates = getCurrentCutoff()
    setStartDate(dates.startDate)
    setEndDate(dates.endDate)
    toast.success("Rentang tanggal diatur ke Periode Cut-off!")
  }

  async function handleFilter() {
    if (!startDate || !endDate || !selectedExcul) {
      return toast.error("Lengkapi filter Tanggal dan Ekskul.")
    }
    setLoading(true)
    setHasSearched(true)
    const res = await fetchAttendanceSessions(selectedExcul, startDate, endDate)
    if (res?.error) {
      toast.error(res.error)
      setSessionList([])
    } else if (res?.data) {
      setSessionList(res.data)
      if (res.data.length === 0) toast.info("Tidak ada riwayat presensi di rentang waktu ini.")
    }
    setLoading(false)
  }

  const handleExportSession = () => {
    if (!selectedSession) return

    const formattedData = selectedSession.students.map((student, idx) => ({
      "No": idx + 1,
      "Nama Siswa": student.name,
      "Kelas": student.class,
      "Status Kehadiran": student.status,
      "Catatan Mentor": student.notes || '-'
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Kehadiran")

    const safeExculName = selectedSession.excul_name.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `Presensi_${safeExculName}_${selectedSession.date}.xlsx`
    
    XLSX.writeFile(workbook, fileName)
    toast.success("File Excel berhasil diunduh!")
  }

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3 items-end">
              
              <div className="space-y-2 w-full md:w-auto">
                <label className="text-sm font-medium text-slate-700">Tanggal Mulai</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-9" />
                </div>
              </div>

              <div className="space-y-2 w-full md:w-auto">
                <label className="text-sm font-medium text-slate-700">Tanggal Akhir</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-9" />
                </div>
              </div>

              <div className="space-y-2 w-full md:w-72">
                <label className="text-sm font-medium text-slate-700">Pilih Ekskul</label>
                <Select value={selectedExcul} onValueChange={setSelectedExcul}>
                  <SelectTrigger><SelectValue placeholder="Semua Ekskul" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold text-blue-600">Lihat Semua Ekskul</SelectItem>
                    {exculs.map((ex) => (<SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleFilter} className="mb-[2px] gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Filter className="w-4 h-4" /> Cari Riwayat
              </Button>
            </div>
            
            <div>
              <Button variant="link" size="sm" onClick={setCutoffThisMonth} className="text-blue-600 p-0 h-auto font-medium">
                ✨ Set ke Periode Bulan Ini (Tgl 20 - 19)
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 bg-slate-50/30">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Mencari riwayat log presensi...</p>
            </div>
          ) : !hasSearched ? (
            <div className="py-16 text-center text-slate-500">
              <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>Atur filter tanggal dan ekskul, lalu klik <b>Cari Riwayat</b>.</p>
            </div>
          ) : sessionList.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <p>Belum ada mentor yang melakukan input presensi pada periode ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionList.map((session) => (
                <Card key={session.id} className="hover:border-blue-300 transition-colors cursor-pointer flex flex-col h-full bg-white" onClick={() => setSelectedSession(session)}>
                  <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{session.excul_name}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Users className="w-3 h-3"/> {session.mentor_name}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-white whitespace-nowrap">
                        {new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                      <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                        <div className="text-xs text-green-600 font-semibold mb-1">Hadir</div>
                        <div className="text-lg font-bold text-green-700">{session.stats.HADIR}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-600 font-semibold mb-1">Izin</div>
                        <div className="text-lg font-bold text-blue-700">{session.stats.IZIN}</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                        <div className="text-xs text-yellow-600 font-semibold mb-1">Sakit</div>
                        <div className="text-lg font-bold text-yellow-700">{session.stats.SAKIT}</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                        <div className="text-xs text-red-600 font-semibold mb-1">Alpha</div>
                        <div className="text-lg font-bold text-red-700">{session.stats.ALPHA}</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200">
                      Lihat Detail Kehadiran Siswa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-start bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedSession.excul_name}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4"/> {new Date(selectedSession.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {selectedSession.mentor_name}</span>
                </div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-md border"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Catatan Mentor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSession.students.map((student, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-500 text-center">{idx + 1}</td>
                      <td className="px-6 py-3 font-bold text-slate-800">{student.name}</td>
                      <td className="px-6 py-3 text-slate-600">{student.class}</td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={getStatusColor(student.status)}>{student.status}</Badge>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs italic">{student.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
              <div>
                {selectedSession.proofImageUrl ? (
                   <a href={process.env.NEXT_PUBLIC_API_BACKEND_URL?.replace('/api', '') + selectedSession.proofImageUrl} target="_blank" rel="noopener noreferrer">
                     <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                       <ImageIcon className="w-4 h-4"/> Lihat Foto Bukti <ExternalLink className="w-3 h-3 ml-1"/>
                     </Button>
                   </a>
                ) : (
                  <span className="text-sm text-slate-500 italic">Tidak ada foto bukti kegiatan.</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 bg-emerald-50/50" onClick={handleExportSession}>
                  <FileSpreadsheet className="w-4 h-4 mr-2"/> Export Excel
                </Button>
                <Button onClick={() => setSelectedSession(null)}>Tutup Detail</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
}