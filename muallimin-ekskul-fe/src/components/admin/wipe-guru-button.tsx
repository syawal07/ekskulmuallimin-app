'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { wipeAllGurus } from "@/actions/guruAction"

export default function WipeGuruButton() {
  const [isWiping, setIsWiping] = useState(false)

  const handleWipe = async () => {
    const confirmation = window.prompt(
      "PERINGATAN BAHAYA!\n\nTindakan ini akan MENGKOSONGKAN DATA PELATIH.\nPelatih yang sudah memiliki riwayat presensi tidak akan dihapus, namun relasi ekskulnya akan dilepas.\n\nKetik 'KOSONGKAN PELATIH' untuk melanjutkan:"
    )

    if (confirmation !== "KOSONGKAN PELATIH") {
      if (confirmation !== null) toast.error("Gagal. Ketik persis 'KOSONGKAN PELATIH'.")
      return
    }

    setIsWiping(true)
    const res = await wipeAllGurus()
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Seluruh data pelatih berhasil dibersihkan.")
    }
    setIsWiping(false)
  }

  return (
    <Button variant="destructive" onClick={handleWipe} disabled={isWiping} className="shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700 font-bold">
      {isWiping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
      Kosongkan Data
    </Button>
  )
}