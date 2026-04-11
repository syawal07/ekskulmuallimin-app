'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, FileSpreadsheet, Upload } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { importStudents } from "@/actions/studentAction"

// Tipe data kolom Excel (agar TypeScript aman)
type RawExcelRow = {
  Nama?: string; Name?: string; nama?: string
  Kelas?: string | number; Class?: string | number; kelas?: string | number
  NIS?: string | number; nis?: string | number
  Ekskul?: string; Excul?: string; ekskul?: string
  [key: string]: unknown
}

export default function ImportStudentButton() {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    
    try {
      // 1. Baca File Excel
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      
      // 2. Ubah ke JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as RawExcelRow[]

      // 3. Mapping data (Normalisasi Header Kolom)
      const formattedData = jsonData.map((row) => ({
        name: String(row['Nama'] || row['Name'] || row['nama'] || ''),
        class: String(row['Kelas'] || row['Class'] || row['kelas'] || ''),
        nis: String(row['NIS'] || row['nis'] || ''),
        exculName: String(row['Ekskul'] || row['Excul'] || row['ekskul'] || '')
      }))

      // 4. Kirim ke Server
      const res = await importStudents(formattedData)

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(`Berhasil import ${res.success ? res.count : 0} siswa!`)
      }

    } catch (error) {
      toast.error("Gagal membaca file Excel. Pastikan format benar.")
      console.error(error)
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = "" // Reset input
    }
  }

  return (
    <>
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <Button 
        variant="outline" 
        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
        Import Excel
      </Button>
    </>
  )
}