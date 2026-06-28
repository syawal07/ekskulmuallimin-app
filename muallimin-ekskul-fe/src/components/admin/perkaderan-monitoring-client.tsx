'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Activity, Search, Filter } from "lucide-react"

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

export default function AdminPerkaderanMonitorClient({ 
  data, 
  jenjangOptions,
  selectedJenjang
}: { 
  data: MonitoringData[],
  jenjangOptions: JenjangOption[],
  selectedJenjang: string
}) {
  const router = useRouter()
  
  // State khusus untuk filter kelas di frontend
  const [selectedKelas, setSelectedKelas] = useState<string>("all")

  // Menangani perubahan filter Jenjang (menembak API ulang)
  const handleJenjangChange = (val: string) => {
    setSelectedKelas("all") // Reset kelas tiap kali jenjang berubah
    if (val === "all") {
      router.push(`/admin/perkaderan/monitoring`)
    } else {
      router.push(`/admin/perkaderan/monitoring?perkaderan_id=${val}`)
    }
  }

  // 1. Ekstrak daftar kelas yang unik dari data saat ini (Otomatis)
  const availableClasses = Array.from(new Set(data.map(item => item.kelas)))
    .filter(Boolean)
    .sort()

  // 2. Filter data berdasarkan kelas yang dipilih
  const filteredData = data.filter(item => {
    if (selectedKelas === "all") return true;
    return item.kelas === selectedKelas;
  })

  // 3. Fungsi untuk Download Data ke CSV (Bisa dibuka di Excel)
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
        alert("Tidak ada data untuk diekspor!");
        return;
    }

    // Buat Header
    const headers = ["Nama Santri", "Kelas", "Jenjang", "Kehadiran (%)", "Nilai Akhir", "Catatan"];
    
    // Buat Baris Data (gunakan tanda kutip agar koma di catatan tidak merusak format CSV)
    const csvRows = filteredData.map(item => [
      `"${item.nama_santri}"`,
      `"${item.kelas}"`,
      `"${item.jenjang}"`,
      `"${item.persentase_hadir}%"`,
      `"${item.nilai}"`,
      `"${item.catatan ? item.catatan.replace(/"/g, '""') : '-'}"` // Escape tanda kutip ganda jika ada
    ].join(","));

    // Gabungkan Header dan Baris
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    // Konversi ke File dan Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const namaJenjang = selectedJenjang === "all" || !selectedJenjang ? "Semua_Jenjang" : jenjangOptions.find(j => j.id.toString() === selectedJenjang)?.nama_jenjang || "Jenjang";
    const namaKelas = selectedKelas === "all" ? "Semua_Kelas" : `Kelas_${selectedKelas.replace(/\s+/g, '')}`;
    
    link.setAttribute("download", `Rekap_Perkaderan_${namaJenjang}_${namaKelas}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Menentukan warna badge nilai
  const getBadgeColor = (nilai: number) => {
    if (nilai >= 85) return "bg-green-100 text-green-700"
    if (nilai >= 70) return "bg-blue-100 text-blue-700"
    if (nilai > 0) return "bg-yellow-100 text-yellow-700"
    return "bg-slate-100 text-slate-500"
  }

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center justify-between text-slate-800 gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" /> Filter & Ekspor
            </div>
            <Button 
              onClick={handleExportCSV} 
              variant="outline" 
              size="sm" 
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
            >
              <Download className="w-4 h-4 mr-2" /> Download Laporan (.csv)
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                 Pilih Jenjang
              </label>
              <Select value={selectedJenjang || "all"} onValueChange={handleJenjangChange}>
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Semua Jenjang Perkaderan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenjang Perkaderan</SelectItem>
                  {jenjangOptions.map(j => (
                    <SelectItem key={j.id} value={j.id.toString()}>{j.nama_jenjang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                 <Filter className="w-3 h-3" /> Filter Kelas
              </label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {availableClasses.map(kelas => (
                    <SelectItem key={kelas} value={kelas}>Kelas {kelas}</SelectItem>
                  ))}
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
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.nama_santri}</div>
                      <div className="text-xs text-slate-500">{item.kelas}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.jenjang}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {item.persentase_hadir}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${getBadgeColor(item.nilai)}`}>
                        {item.nilai > 0 ? item.nilai : 'Belum Dinilai'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate" title={item.catatan}>
                      {item.catatan || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data santri yang ditemukan pada filter ini.
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