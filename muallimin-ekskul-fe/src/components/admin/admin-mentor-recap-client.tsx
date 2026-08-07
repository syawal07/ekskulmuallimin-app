'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Filter, Users, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fetchMentorRecap } from "@/actions/attendanceAction"

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCurrentCutoff = () => {
  const today = new Date()
  const currentDay = today.getDate()
  let start, end

  if (currentDay <= 19) {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 20)
    end = new Date(today.getFullYear(), today.getMonth(), 19)
  } else {
    start = new Date(today.getFullYear(), today.getMonth(), 20)
    end = new Date(today.getFullYear(), today.getMonth() + 1, 19)
  }

  return {
    startDate: formatDateLocal(start),
    endDate: formatDateLocal(end)
  }
}

interface MentorRecapData {
  nama_pelatih: string
  nama_ekskul: string
  total_hadir: number
  tanggal_mengajar: string
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium ${className}`} {...props} />
}

export default function AdminMentorRecapClient() {
  const initialDates = getCurrentCutoff()
  const [startDate, setStartDate] = useState(initialDates.startDate)
  const [endDate, setEndDate] = useState(initialDates.endDate)
  const [dataList, setDataList] = useState<MentorRecapData[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const setCutoffThisMonth = () => {
    const dates = getCurrentCutoff()
    setStartDate(dates.startDate)
    setEndDate(dates.endDate)
    toast.success("Rentang tanggal diatur ke Periode Cut-off!")
  }

  async function handleFilter() {
    if (!startDate || !endDate) {
      return toast.error("Lengkapi filter Tanggal terlebih dahulu.")
    }
    setLoading(true)
    setHasSearched(true)
    
    const res = await fetchMentorRecap(startDate, endDate)
    
    if (res?.error) {
      toast.error(res.error)
      setDataList([])
    } else if (res?.data) {
      setDataList(res.data)
      if (res.data.length === 0) toast.info("Tidak ada riwayat kehadiran pelatih di rentang waktu ini.")
    }
    
    setLoading(false)
  }

  const handleExportExcel = () => {
    if (dataList.length === 0) return
    const baseUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL || ""
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    window.location.href = `${cleanBaseUrl}/admin/attendances/export-mentor-recap?start_date=${startDate}&end_date=${endDate}`
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
              
              <Button onClick={handleFilter} className="mb-[2px] gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
                <Filter className="w-4 h-4" /> Cari Riwayat
              </Button>

              {dataList.length > 0 && (
                <Button variant="outline" onClick={handleExportExcel} className="mb-[2px] gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold shadow-sm ml-auto">
                  <FileSpreadsheet className="w-4 h-4" /> Export Excel
                </Button>
              )}
            </div>
            
            <div>
              <Button variant="link" size="sm" onClick={setCutoffThisMonth} className="text-amber-600 hover:text-amber-700 p-0 h-auto font-bold tracking-tight">
                  Set ke Periode Bulan Ini (Tgl 20 - 19)
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 bg-slate-50/30">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Mencari riwayat kehadiran pelatih...</p>
            </div>
          ) : !hasSearched ? (
            <div className="py-16 text-center text-slate-500">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>Atur filter tanggal, lalu klik <b className="text-blue-600">Cari Riwayat</b>.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="w-[50px] text-center font-bold">No</TableHead>
                    <TableHead className="font-bold">Nama Pelatih</TableHead>
                    <TableHead className="font-bold">Mengampu Ekskul</TableHead>
                    <TableHead className="text-center font-bold text-green-700">Total Kehadiran</TableHead>
                    <TableHead className="font-bold">Rincian Tanggal Mengajar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500">Belum ada pelatih yang melakukan input presensi pada periode ini.</TableCell>
                    </TableRow>
                  ) : (
                    dataList.map((data, index) => (
                      <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="text-center text-slate-500 font-medium">{index + 1}</TableCell>
                        <TableCell className="font-bold text-slate-900">{data.nama_pelatih}</TableCell>
                        <TableCell className="text-slate-600">{data.nama_ekskul}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                            {data.total_hadir} Hari
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm max-w-[250px] leading-relaxed">
                          {data.tanggal_mengajar}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}