'use client'

import { useState, useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2, FileSpreadsheet } from "lucide-react"
import { importStudents } from "@/actions/studentAction"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface ExcelRow {
  nis?: string | number
  nama?: string
  name?: string
  kelas?: string
  nisn?: string | number
  class?: string
  angkatan?: string | number
  jenis_kelamin?: string
  jabatan_organisasi?: string
  perkaderan?: string
  ekskul?: string
  exculName?: string
}

export default function ImportStudentButton() {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        nis: "11517",
        nama: "Ahmad Dahlan",
        kelas: "7 LSA",
        nisn: "0012345678",
        angkatan: "2025",
        jenis_kelamin: "L",
        jabatan_organisasi: "Anggota",
        perkaderan: "TKM 1",
        ekskul: "Informatika dan Teknologi (Sedayu), Tapak Suci"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Siswa");
    XLSX.writeFile(wb, "Template_Import_Siswa.xlsx");
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const workbook = XLSX.read(bstr, { type: 'binary' })
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        // Tambahkan as ExcelRow[] agar TypeScript tidak bingung
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]

        const formattedData = jsonData.map((row) => ({
          nis: row.nis?.toString(),
          name: row.nama || row.name || "",
          class: row.kelas || row.class || "",
          nisn: row.nisn?.toString(),
          angkatan: row.angkatan?.toString(),
          jenis_kelamin: row.jenis_kelamin,
          jabatan_organisasi: row.jabatan_organisasi,
          perkaderanName: row.perkaderan,
          exculName: row.ekskul || row.exculName || ""
        }))

        startTransition(async () => {
          const res = await importStudents(formattedData)
          if (res?.error) {
            toast.error(res.error)
          } else if (res?.success) {
            toast.success(`Berhasil mengimpor ${res.count} partisipasi siswa`)
          }
        })
      } catch (error) {
        toast.error("Format file tidak didukung atau terjadi kesalahan")
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleDownloadTemplate}
        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
      >
        <FileDown className="w-4 h-4 mr-2" />
        Unduh Template
      </Button>
      
      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="text-blue-700 border-blue-200 hover:bg-blue-50"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4 mr-2" />
        )}
        Import Excel
      </Button>
    </div>
  )
}