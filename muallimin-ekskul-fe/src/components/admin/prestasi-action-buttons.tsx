'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteAchievement } from "@/actions/achievementAction"
import { toast } from "sonner"

export default function PrestasiActionButtons({ id }: { id: number }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus data prestasi ini?")) {
      setLoading(true)
      const res = await deleteAchievement(id)
      setLoading(false)

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Prestasi berhasil dihapus")
      }
    }
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleDelete}
      disabled={loading}
      className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  )
}