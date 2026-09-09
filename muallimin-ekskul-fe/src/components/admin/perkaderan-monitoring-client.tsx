'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, Activity, Search, Filter, ChevronLeft, ChevronRight, Loader2, Plus, ChevronsUpDown, Check, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// Import 3 Actions yang baru saja dibuat
import { fetchAdminPerkaderanMonitor, fetchUnregisteredStudents, enrollStudentToPerkaderan } from "@/actions/perkaderanAction"

interface MonitoringData {
  id: number;
  nama_santri: string;
  kelas: string;
  jenjang: string;
  persentase_hadir: number;
  nilai: number;
  catatan: string;
}

interface JenjangOption {
  id: number;
  nama_jenjang: string;
}

interface SearchStudent {
  id: string;
  name: string;
  class: string;
}

export default function AdminPerkaderanMonitorClient({ 
  jenjangOptions
}: { 
  jenjangOptions: JenjangOption[]
}) {
  const [data, setData] = useState<MonitoringData[]>([])
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [selectedJenjang, setSelectedJenjang] = useState<string>("all")
  const [selectedKelas, setSelectedKelas] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [limit, setLimit] = useState("10")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  // State Pendaftaran Susulan
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [unregisteredStudents, setUnregisteredStudents] = useState<SearchStudent[]>([])
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [selectedNewStudent, setSelectedNewStudent] = useState<string>("")
  const [isEnrolling, setIsEnrolling] = useState(false)

  // Memanggil Action untuk fetch tabel (Aman dari Linter & CORS)
  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetchAdminPerkaderanMonitor(selectedJenjang, selectedKelas, limit, page, searchQuery)
    
    if (res?.error) {
      toast.error(res.error)
    } else if (res?.success && res.data) {
      setData(res.data.data)
      if (res.data.classes) setAvailableClasses(res.data.classes)
      setTotalPages(res.data.meta?.last_page || 1)
    }
    setLoading(false)
  }, [selectedJenjang, selectedKelas, limit, page, searchQuery])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [fetchData])

  // Memanggil Action pencarian siswa (Aman dari Linter & CORS)
  useEffect(() => {
    const fetchUnregistered = async () => {
      if (!selectedJenjang || selectedJenjang === "all") return;
      const res = await fetchUnregisteredStudents(selectedJenjang, studentSearchQuery)
      if (res?.success) setUnregisteredStudents(res.data)
    }

    if (isAddModalOpen && selectedJenjang !== "all") {
      const delay = setTimeout(() => fetchUnregistered(), 300);
      return () => clearTimeout(delay);
    }
  }, [studentSearchQuery, isAddModalOpen, selectedJenjang])

  // Memanggil Action Submit Pendaftaran (Aman dari Linter & CORS)
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNewStudent || selectedJenjang === "all") return

    setIsEnrolling(true)
    const res = await enrollStudentToPerkaderan(selectedJenjang, [selectedNewStudent])
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Siswa berhasil ditambahkan!")
      setIsAddModalOpen(false)
      setSelectedNewStudent("")
      setStudentSearchQuery("")
      fetchData() // Refresh Table
    }
    setIsEnrolling(false)
  }

  const handleExportCSV = () => {
    if (data.length === 0) return alert("Tidak ada data untuk diekspor!");
    const headers = ["Nama Santri", "Kelas", "Jenjang", "Kehadiran (%)", "Nilai Akhir", "Catatan"];
    const csvRows = data.map(item => [
      `"${item.nama_santri}"`, `"${item.kelas}"`, `"${item.jenjang}"`,
      `"${item.persentase_hadir}%"`, `"${item.nilai}"`,
      `"${item.catatan ? item.catatan.replace(/"/g, '""') : '-'}"`
    ].join(","));
    
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const namaJenjang = selectedJenjang === "all" ? "Semua_Jenjang" : jenjangOptions.find(j => j.id.toString() === selectedJenjang)?.nama_jenjang || "Jenjang";
    const namaKelas = selectedKelas === "all" ? "Semua_Kelas" : `Kelas_${selectedKelas.replace(/\s+/g, '')}`;
    
    link.setAttribute("download", `Rekap_Perkaderan_${namaJenjang}_${namaKelas}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getBadgeColor = (nilai: number) => {
    if (nilai >= 85) return "bg-green-100 text-green-700"
    if (nilai >= 70) return "bg-blue-100 text-blue-700"
    if (nilai > 0) return "bg-yellow-100 text-yellow-700"
    return "bg-slate-100 text-slate-500"
  }

  const selectedStudentObj = unregisteredStudents.find(s => s.id === selectedNewStudent)

  return (
    <div className="space-y-6 mt-6 pb-12">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center justify-between text-slate-800 gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" /> Filter & Ekspor
            </div>
            <div className="flex gap-2">
              {selectedJenjang !== "all" && (
                <Button 
                  onClick={() => setIsAddModalOpen(true)} 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> Tambah Peserta
                </Button>
              )}
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                <Download className="w-4 h-4 mr-2" /> Download Laporan
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Pilih Jenjang</label>
              <Select value={selectedJenjang} onValueChange={(val) => { setSelectedJenjang(val); setSelectedKelas("all"); setPage(1); }}>
                <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Semua Jenjang" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenjang</SelectItem>
                  {jenjangOptions?.map(j => <SelectItem key={j.id} value={j.id.toString()}>{j.nama_jenjang}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase"><Filter className="w-3 h-3 inline" /> Kelas</label>
              <Select value={selectedKelas} onValueChange={(val) => { setSelectedKelas(val); setPage(1); }}>
                <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {availableClasses.map(kelas => <SelectItem key={kelas} value={kelas}>Kelas {kelas}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Pencarian</label>
              <Input placeholder="Cari nama santri..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Baris / Halaman</label>
              <Select value={limit} onValueChange={(val) => { setLimit(val); setPage(1); }}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Baris</SelectItem>
                  <SelectItem value="25">25 Baris</SelectItem>
                  <SelectItem value="50">50 Baris</SelectItem>
                  <SelectItem value="all">Semua Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50">
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Rekapitulasi Akhir
          </CardTitle>
        </CardHeader>
        
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Santri</th>
                  <th className="px-6 py-4">Jenjang</th>
                  <th className="px-6 py-4 text-center">Kehadiran (%)</th>
                  <th className="px-6 py-4 text-center">Nilai Akhir</th>
                  <th className="px-6 py-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{item.nama_santri}</div>
                        <div className="text-xs text-slate-500">{item.kelas}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{item.jenjang}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{item.persentase_hadir}%</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${getBadgeColor(item.nilai)}`}>
                          {item.nilai > 0 ? item.nilai : 'Belum Dinilai'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate" title={item.catatan}>{item.catatan || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Tidak ada data santri ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <span className="text-sm font-medium text-slate-500">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="bg-white"><ChevronLeft className="w-4 h-4 mr-1"/> Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-white">Next <ChevronRight className="w-4 h-4 ml-1"/></Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Tambah Peserta Susulan */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">Daftarkan Peserta Susulan</h3>
              <button onClick={() => { setIsAddModalOpen(false); setSelectedNewStudent(""); }} className="text-slate-400 hover:text-slate-700" disabled={isEnrolling}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEnroll} className="p-6 space-y-6">
              <div className="space-y-3 flex flex-col">
                <label className="text-slate-700 font-semibold text-sm">Cari Santri dari Data Induk</label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between font-normal bg-white h-12 text-left" disabled={isEnrolling}>
                      {selectedStudentObj ? `${selectedStudentObj.name} - Kelas ${selectedStudentObj.class}` : "Ketik nama santri..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0 z-[110]" align="start">
                    <Command>
                      <CommandInput placeholder="Cari nama..." onValueChange={setStudentSearchQuery} />
                      <CommandList>
                        <CommandEmpty>Tidak ditemukan atau sudah terdaftar.</CommandEmpty>
                        <CommandGroup>
                          {unregisteredStudents.map((s) => (
                            <CommandItem key={s.id} value={`${s.name} ${s.class}`} onSelect={() => { setSelectedNewStudent(s.id); setOpenCombobox(false); }} className="cursor-pointer py-3">
                              <Check className={cn("mr-2 h-4 w-4", selectedNewStudent === s.id ? "opacity-100 text-emerald-600" : "opacity-0")} />
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-800">{s.name}</span>
                                <span className="text-xs text-slate-500">Kelas {s.class}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end gap-3 pt-2 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={isEnrolling}>Batal</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]" disabled={isEnrolling || !selectedNewStudent}>
                  {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Tambahkan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}