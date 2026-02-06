'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FilterDate() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const now = new Date()
  const currentMonthStr = searchParams.get("month") || (now.getMonth() + 1).toString()
  const currentYearStr = searchParams.get("year") || now.getFullYear().toString()

  // --- LOGIKA TAHUN OTOMATIS ---
  // Mulai dari 2025 (Awal Sistem) sampai Tahun Depan (Current + 1)
  const startYear = 2025
  const endYear = now.getFullYear() + 1 
  
  const years = []
  for (let y = startYear; y <= endYear; y++) {
    years.push(y.toString())
  }
  // Hasilnya: ["2025", "2026", "2027", ...] (Nambah sendiri tiap tahun)

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 mb-6">
      {/* FILTER BULAN */}
      <Select value={currentMonthStr} onValueChange={(val: string) => handleFilter("month", val)}>
        <SelectTrigger className="w-[180px] bg-white border-slate-200 shadow-sm">
          <SelectValue placeholder="Pilih Bulan" />
        </SelectTrigger>
        <SelectContent>
          {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
            <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* FILTER TAHUN (DINAMIS) */}
      <Select value={currentYearStr} onValueChange={(val: string) => handleFilter("year", val)}>
        <SelectTrigger className="w-[120px] bg-white border-slate-200 shadow-sm">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}