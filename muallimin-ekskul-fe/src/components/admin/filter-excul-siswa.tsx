'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Excul = {
  id: string
  name: string
}

export default function FilterExculSiswa({ 
  exculs,
  classes = []
}: { 
  exculs: Excul[]
  classes?: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentExcul = searchParams.get("exculId") || "all"
  const currentKelas = searchParams.get("kelas") || "all"

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set("page", "1")

    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select value={currentKelas} onValueChange={(val) => handleFilterChange("kelas", val)}>
        <SelectTrigger className="w-[160px] bg-white border-slate-200 shadow-sm">
          <SelectValue placeholder="Filter Kelas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">📚 Semua Kelas</SelectItem>
          {classes.map((cls) => (
            <SelectItem key={cls} value={cls}>
              Kelas {cls}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentExcul} onValueChange={(val) => handleFilterChange("exculId", val)}>
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
    </div>
  )
}