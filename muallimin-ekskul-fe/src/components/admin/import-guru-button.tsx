'use client'

import { useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2, FileSpreadsheet } from "lucide-react"
import { importGurus } from "@/actions/guruAction"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface ExcelRow {
  name?: string
  username?: string
  password?: string | number
  role?: string
  exculName?: string
}

export default function ImportGuruButton() {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        name: "Ahmad Hawari Jundullah, S.Pd",
        username: "kt-ahmadhawarijundullah",
        password: "kampusterpadu",
        role: "MENTOR",
        exculName: "68 Store (Terpadu), Bola Basket (Terpadu)"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Pelatih");
    XLSX.writeFile(wb, "Template_Import_Pelatih.xlsx");
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]

        const formattedData = jsonData.map((row) => ({
          name: row.name || "",
          username: row.username || "",
          password: row.password?.toString(),
          role: row.role?.toString(),
          exculName: row.exculName?.toString()
        }))

        startTransition(async () => {
          const res = await importGurus(formattedData)
          if (res?.error) {
            toast.error(res.error)
          } else if (res?.success) {
            toast.success(`Berhasil mengimpor ${res.count} data pelatih`)
          }
        })
      } catch (error) {
        toast.error("Format file tidak didukung atau terjadi kesalahan")
      }
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleDownloadTemplate} className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 bg-white">
        <FileDown className="w-4 h-4 mr-2" /> Template
      </Button>
      <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPending} className="text-blue-700 border-blue-200 hover:bg-blue-50 bg-white">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />} Import
      </Button>
    </div>
  )
}