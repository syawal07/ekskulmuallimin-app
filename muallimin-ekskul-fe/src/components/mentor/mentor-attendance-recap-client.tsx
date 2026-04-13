'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Filter, FileSpreadsheet, Eye, X, AlertCircle, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fetchMentorAttendanceRecap } from "@/actions/attendanceAction"
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
interface HistoryRecord { date: string; status: string; notes: string | null; }
interface RecapData {
  student_id: string;
  student_name: string;
  student_class: string;
  summary: { hadir: number; izin: number; sakit: number; alpha: number; total_meetings: number; };
  history: HistoryRecord[];
}

export default function MentorAttendanceRecapClient({ exculs }: { exculs: Excul[] }) {
  const initialDates = getCurrentCutoff()
  const [startDate, setStartDate] = useState(initialDates.startDate)
  const [endDate, setEndDate] = useState(initialDates.endDate)
  const [selectedExcul, setSelectedExcul] = useState(exculs.length > 0 ? exculs[0].id : "")
  
  const [dataList, setDataList] = useState<RecapData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<RecapData | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const setCutoffThisMonth = () => {
    const dates = getCurrentCutoff()
    setStartDate(dates.startDate)
    setEndDate(dates.endDate)
    toast.success("Rentang tanggal diatur ke Periode Cut-off!")
  }

  async function handleFilter() {
    if (!startDate || !endDate || !selectedExcul) {
      return toast.error("Lengkapi filter Tanggal dan Ekskul terlebih dahulu.")
    }
    setLoading(true)
    const res = await fetchMentorAttendanceRecap(selectedExcul, startDate, endDate)
    if (res?.error) {
      toast.error(res.error)
      setDataList([])
    } else if (res?.data) {
      setDataList(res.data)
      setSearchQuery("")
      setCurrentPage(1)
      if (res.data.length === 0) toast.info("Tidak ada data di rentang tanggal tersebut.")
    }
    setLoading(false)
  }

  const handleExportExcel = () => {
    if (dataList.length === 0) return

    const formattedData = dataList.map((item, index) => ({
      "No": index + 1,
      "Nama Siswa": item.student_name,
      "Kelas": item.student_class,
      "Total Pertemuan": item.summary.total_meetings,
      "Hadir (H)": item.summary.hadir,
      "Izin (I)": item.summary.izin,
      "Sakit (S)": item.summary.sakit,
      "Alpha (A)": item.summary.alpha
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Presensi")

    const exculName = exculs.find(e => e.id === selectedExcul)?.name?.replace(/[^a-zA-Z0-9]/g, '_') || "Ekskul"
    const fileName = `Rekap_Presensi_${exculName}_${startDate}_sd_${endDate}.xlsx`
    
    XLSX.writeFile(workbook, fileName)
    toast.success("File Rekap Excel berhasil diunduh!")
  }

  const filteredData = dataList.filter(item => 
    item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.student_class.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
              <div className="flex flex-col md:flex-row gap-3 items-end w-full xl:w-auto">
                
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

                <div className="space-y-2 w-full md:w-64">
                  <label className="text-sm font-medium text-slate-700">Pilih Ekskul</label>
                  <Select value={selectedExcul} onValueChange={setSelectedExcul}>
                    <SelectTrigger><SelectValue placeholder="-- Pilih Ekskul --" /></SelectTrigger>
                    <SelectContent>{exculs.map((ex) => (<SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>

                <Button onClick={handleFilter} className="mb-[2px] gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Filter className="w-4 h-4" /> Tampilkan Rekap
                </Button>
              </div>

              {dataList.length > 0 && (
                <Button variant="outline" onClick={handleExportExcel} className="mb-[2px] gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                  <FileSpreadsheet className="w-4 h-4" /> Export Excel
                </Button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <Button variant="link" size="sm" onClick={setCutoffThisMonth} className="text-blue-600 p-0 h-auto font-medium">
                ✨ Set ke Periode Bulan Ini (Tgl 20 - 19)
              </Button>
              
              {dataList.length > 0 && (
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Cari nama siswa atau kelas..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Mengkalkulasi rekapitulasi data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="w-[50px] text-center font-bold">No</TableHead>
                    <TableHead className="font-bold">Nama Siswa</TableHead>
                    <TableHead className="font-bold">Kelas</TableHead>
                    <TableHead className="text-center font-bold">Total Pertemuan</TableHead>
                    <TableHead className="text-center font-bold text-green-700">Hadir (H)</TableHead>
                    <TableHead className="text-center font-bold text-blue-700">Izin (I)</TableHead>
                    <TableHead className="text-center font-bold text-yellow-700">Sakit (S)</TableHead>
                    <TableHead className="text-center font-bold text-red-700">Alpha (A)</TableHead>
                    <TableHead className="text-center font-bold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataList.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="h-48 text-center text-slate-500">Silakan pilih Tanggal dan Ekskul terlebih dahulu.</TableCell></TableRow>
                  ) : currentData.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="h-32 text-center text-slate-500">Pencarian &quot;{searchQuery}&quot; tidak ditemukan.</TableCell></TableRow>
                  ) : (
                    currentData.map((data, index) => {
                      const isWarning = data.summary.alpha >= 3;
                      const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <TableRow key={data.student_id} className={`transition-colors ${isWarning ? 'bg-red-50/70 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                          <TableCell className="text-center text-slate-500">{globalIndex}</TableCell>
                          <TableCell className="font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              {data.student_name}
                              {isWarning && <span title="Sering Alpha (Lebih dari 3x)"><AlertCircle className="w-4 h-4 text-red-500" /></span>}
                            </div>
                          </TableCell>
                          <TableCell>{data.student_class}</TableCell>
                          <TableCell className="text-center font-bold">{data.summary.total_meetings}</TableCell>
                          <TableCell className="text-center font-medium text-green-600">{data.summary.hadir}</TableCell>
                          <TableCell className="text-center font-medium text-blue-600">{data.summary.izin}</TableCell>
                          <TableCell className="text-center font-medium text-yellow-600">{data.summary.sakit}</TableCell>
                          <TableCell className={`text-center font-bold ${isWarning ? 'text-red-600 text-lg' : 'text-slate-600'}`}>{data.summary.alpha}</TableCell>
                          <TableCell className="text-center">
                            <Button size="sm" variant="outline" className="text-blue-600 bg-white" onClick={() => setSelectedStudent(data)}>
                              <Eye className="w-4 h-4 mr-1"/> Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <div className="text-sm text-slate-500">
                Menampilkan <b>{currentData.length}</b> dari <b>{filteredData.length}</b> siswa
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="bg-white">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="bg-white">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">Riwayat Kehadiran Siswa</h3>
                <p className="text-sm text-slate-500">{selectedStudent.student_name} - {selectedStudent.student_class}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {selectedStudent.history.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Belum ada catatan kehadiran di rentang tanggal ini.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-xs text-slate-500 uppercase sticky top-0">
                    <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Catatan Mentor</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStudent.history.map((hist, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{new Date(hist.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className={getStatusColor(hist.status)}>{hist.status}</Badge></td>
                        <td className="px-4 py-3 text-slate-500 text-xs italic">{hist.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <Button onClick={() => setSelectedStudent(null)}>Tutup</Button>
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