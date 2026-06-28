'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Loader2, History, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { deletePerkaderanSession } from "@/actions/perkaderanAction"

interface HistoryStats {
  HADIR: number;
  IZIN: number;
  SAKIT: number;
  ALPHA: number;
}

interface HistoryItem {
  date: string;
  perkaderanId: number;
  perkaderanName: string;
  stats: HistoryStats;
}

export default function PerkaderanHistoryClient({ 
  initialData, 
  currentMonth, 
  currentYear 
}: { 
  initialData: HistoryItem[],
  currentMonth: number,
  currentYear: number
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleFilterChange = (type: 'month' | 'year', value: string) => {
    const newMonth = type === 'month' ? value : currentMonth
    const newYear = type === 'year' ? value : currentYear
    router.push(`/mentor/perkaderan/riwayat?month=${newMonth}&year=${newYear}`)
  }

  const handleDelete = async (date: string, perkaderanId: number) => {
    if (!confirm("Hapus seluruh presensi pada sesi ini? Data tidak dapat dikembalikan.")) return
    
    setIsDeleting(`${date}-${perkaderanId}`)
    const result = await deletePerkaderanSession(date, perkaderanId.toString())
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Sesi berhasil dihapus.")
    }
    setIsDeleting(null)
  }

  const months = [
    { value: "1", label: "Januari" }, { value: "2", label: "Februari" }, { value: "3", label: "Maret" },
    { value: "4", label: "April" }, { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "Agustus" }, { value: "9", label: "September" },
    { value: "10", label: "Oktober" }, { value: "11", label: "November" }, { value: "12", label: "Desember" }
  ]

  const currentYearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString())

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <CalendarDays className="w-5 h-5 text-blue-600" /> Filter Bulan & Tahun
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 max-w-md">
            <Select value={currentMonth.toString()} onValueChange={(val) => handleFilterChange('month', val)}>
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={currentYear.toString()} onValueChange={(val) => handleFilterChange('year', val)}>
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {currentYearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50">
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" /> Sesi yang Telah Dilaksanakan
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jenjang Perkaderan</th>
                <th className="px-6 py-4 text-center">Hadir</th>
                <th className="px-6 py-4 text-center">Izin</th>
                <th className="px-6 py-4 text-center">Sakit</th>
                <th className="px-6 py-4 text-center">Alpha</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialData.length > 0 ? (
                initialData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.perkaderanName}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{item.stats.HADIR}</td>
                    <td className="px-6 py-4 text-center font-bold text-yellow-600">{item.stats.IZIN}</td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">{item.stats.SAKIT}</td>
                    <td className="px-6 py-4 text-center font-bold text-red-600">{item.stats.ALPHA}</td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(item.date, item.perkaderanId)}
                        disabled={isDeleting === `${item.date}-${item.perkaderanId}`}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        {isDeleting === `${item.date}-${item.perkaderanId}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Belum ada riwayat presensi di bulan ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}