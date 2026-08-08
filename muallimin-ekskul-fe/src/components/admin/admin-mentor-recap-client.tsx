'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Filter, Users, FileSpreadsheet, Loader2, Printer, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import * as XLSX from "xlsx"
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
  id_mentor: string
  nama_pelatih: string
  nama_ekskul: string
  total_hadir_mengajar: number
  tanggal_mengajar?: string[]
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

    const formattedData = dataList.map((item, index) => ({
      "No": index + 1,
      "Nama Pelatih": item.nama_pelatih,
      "Mengampu Ekskul": item.nama_ekskul,
      "Tanggal Mengajar / Presensi": item.tanggal_mengajar?.map(d => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })).join(', ') || '-',
      "Total Hadir (Hari)": item.total_hadir_mengajar
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kehadiran Pelatih")
    
    const fileName = `Rekap_Kehadiran_Pelatih_${startDate}_sd_${endDate}.xlsx`
    XLSX.writeFile(workbook, fileName)
    
    toast.success("File Excel berhasil diunduh!")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyText = () => {
    if (dataList.length === 0) return
    let text = `*REKAP KEHADIRAN PELATIH EKSKUL*\n*Periode:* ${startDate} s/d ${endDate}\n\n`
    
    dataList.forEach((item, index) => {
      const dates = item.tanggal_mengajar?.map(d => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })).join(', ') || '-'
      text += `${index + 1}. *${item.nama_pelatih}*\n`
      text += `   Ekskul: ${item.nama_ekskul}\n`
      text += `   Tanggal: ${dates}\n`
      text += `   Total: ${item.total_hadir_mengajar} Hari\n\n`
    })

    navigator.clipboard.writeText(text)
    toast.success("Teks rekap berhasil disalin ke clipboard!")
  }

  return (
    <div className="space-y-6 mt-6 print:absolute print:left-0 print:top-0 print:w-full print:bg-white print:z-[9999] print:p-8">
      <div className="hidden print:block mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Rekap Kehadiran Pelatih Ekstrakurikuler</h2>
        <p className="text-slate-600">Periode: {startDate} s/d {endDate}</p>
      </div>

      <Card className="border-slate-200 shadow-sm print:shadow-none print:border-none">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 print:hidden">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
              <div className="flex flex-col md:flex-row gap-3 items-end w-full lg:w-auto">
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
                
                <Button onClick={handleFilter} className="mb-[2px] gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm w-full md:w-auto">
                  <Filter className="w-4 h-4" /> Cari Riwayat
                </Button>
              </div>

              {dataList.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                  <Button variant="outline" onClick={handleCopyText} className="gap-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm flex-1 md:flex-none">
                    <Copy className="w-4 h-4" /> Salin Teks (WA)
                  </Button>
                  <Button variant="outline" onClick={handlePrint} className="gap-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold shadow-sm flex-1 md:flex-none">
                    <Printer className="w-4 h-4" /> Cetak
                  </Button>
                  <Button variant="outline" onClick={handleExportExcel} className="gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold shadow-sm flex-1 md:flex-none">
                    <FileSpreadsheet className="w-4 h-4" /> Export Excel
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Button variant="link" size="sm" onClick={setCutoffThisMonth} className="text-amber-600 hover:text-amber-700 p-0 h-auto font-bold tracking-tight">
                  Set ke Periode Bulan Ini (Tgl 20 - 19)
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 bg-slate-50/30 print:p-0 print:bg-white">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 print:hidden">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Mencari riwayat kehadiran pelatih...</p>
            </div>
          ) : !hasSearched ? (
            <div className="py-16 text-center text-slate-500 print:hidden">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>Atur filter tanggal, lalu klik <b className="text-blue-600">Cari Riwayat</b>.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg print:border-none print:shadow-none">
              <Table className="print:text-sm">
                <TableHeader className="bg-slate-100 print:bg-transparent">
                  <TableRow className="print:border-b-2 print:border-black">
                    <TableHead className="w-[50px] text-center font-bold print:text-black">No</TableHead>
                    <TableHead className="font-bold print:text-black">Nama Pelatih</TableHead>
                    <TableHead className="font-bold print:text-black">Mengampu Ekskul</TableHead>
                    <TableHead className="font-bold print:text-black min-w-[250px]">Tanggal Mengajar / Presensi</TableHead>
                    <TableHead className="text-center font-bold text-green-700 print:text-black">Total Kehadiran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500 print:hidden">Belum ada pelatih yang melakukan input presensi pada periode ini.</TableCell>
                    </TableRow>
                  ) : (
                    dataList.map((data, index) => (
                      <TableRow key={`${data.id_mentor}-${index}`} className="hover:bg-slate-50 transition-colors print:border-b print:border-slate-300">
                        <TableCell className="text-center text-slate-500 font-medium print:text-black">{index + 1}</TableCell>
                        <TableCell className="font-bold text-slate-900 print:text-black">{data.nama_pelatih}</TableCell>
                        <TableCell className="text-slate-600 print:text-black">{data.nama_ekskul}</TableCell>
                        <TableCell className="text-slate-600 print:text-black leading-relaxed">
                          {data.tanggal_mengajar?.map(d => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })).join(', ') || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-sm print:bg-transparent print:text-black print:p-0">
                            {data.total_hadir_mengajar} Hari
                          </span>
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