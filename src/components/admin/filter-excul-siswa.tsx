'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Excul = {
  id: string
  name: string
}

export default function FilterExculSiswa({ exculs }: { exculs: Excul[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Ambil nilai ekskul yang sedang dipilih dari URL (jika ada)
  const currentExcul = searchParams.get("exculId") || "all"

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === "all") {
      params.delete("exculId") // Hapus filter jika pilih "Semua"
    } else {
      params.set("exculId", value) // Set filter ID
      params.set("page", "1") // Reset ke halaman 1 tiap ganti filter
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <Select value={currentExcul} onValueChange={handleFilterChange}>
      <SelectTrigger className="w-[200px] bg-white border-slate-200 shadow-sm">
        <SelectValue placeholder="Filter Ekskul" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">📂 Semua Ekskul</SelectItem>
        {exculs.map((ex) => (
          <SelectItem key={ex.id} value={ex.id}>
            🏆 {ex.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}