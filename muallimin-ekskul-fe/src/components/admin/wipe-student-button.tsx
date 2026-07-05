'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { wipeAllStudents } from "@/actions/studentAction"

export default function WipeStudentButton() {
  const [isWiping, setIsWiping] = useState(false)

  const handleWipe = async () => {
    const confirmation = window.prompt(
      "PERINGATAN BAHAYA!\n\nTindakan ini akan MENGHAPUS SELURUH DATA SISWA secara permanen beserta riwayatnya dari sistem.\n\nKetik 'HAPUS SEMUA' untuk melanjutkan:"
    )

    if (confirmation !== "HAPUS SEMUA") {
      if (confirmation !== null) {
        toast.error("Validasi gagal. Ketik persis 'HAPUS SEMUA' dengan huruf kapital.")
      }
      return
    }

    setIsWiping(true)
    const res = await wipeAllStudents()
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Seluruh data siswa berhasil dikosongkan.")
    }
    setIsWiping(false)
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleWipe} 
      disabled={isWiping}
      className="shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700 font-bold"
    >
      {isWiping ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <AlertTriangle className="w-4 h-4 mr-2" />
      )}
      Kosongkan Data
    </Button>
  )
}