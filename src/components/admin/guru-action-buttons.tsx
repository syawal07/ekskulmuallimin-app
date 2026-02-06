'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { KeyRound, Trash2, Loader2 } from "lucide-react"
import { deleteMentor, resetMentorPassword } from "@/actions/authAction"
import { toast } from "sonner" // Import Toast Keren
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Import Modal Keren

export default function GuruActionButtons({ 
  userId, 
  userName 
}: { 
  userId: string
  userName: string 
}) {
  const [loading, setLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openReset, setOpenReset] = useState(false)

  // HANDLER: HAPUS USER
  const handleDelete = async () => {
    setLoading(true)
    const res = await deleteMentor(userId)
    setLoading(false)
    setOpenDelete(false) // Tutup modal

    if (res?.error) {
      toast.error(res.error) // Notifikasi Merah
    } else {
      toast.success("Akun guru berhasil dihapus!") // Notifikasi Hijau
    }
  }

  // HANDLER: RESET PASSWORD
  const handleReset = async () => {
    setLoading(true)
    const res = await resetMentorPassword(userId)
    setLoading(false)
    setOpenReset(false) // Tutup modal

    if (res?.error) {
      toast.error(res.error)
    } else {
      // Tampilkan password baru di toast dengan durasi lama (10 detik) biar sempat dicopy
      toast.success(`Password Reset: ${res.newPassword}`, {
        duration: 10000,
        description: "Silakan salin password default ini.",
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(res.newPassword || "")
        }
      })
    }
  }

  return (
    <div className="flex justify-end gap-2">
      
      {/* === MODAL 1: RESET PASSWORD === */}
      <AlertDialog open={openReset} onOpenChange={setOpenReset}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300" 
            title="Reset Password"
            disabled={loading}
          >
            <KeyRound className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
            <AlertDialogDescription>
              Password untuk <b>{userName}</b> akan dikembalikan menjadi default (<b>password123</b>).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault() // Mencegah modal nutup otomatis sebelum selesai loading
                handleReset()
              }}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Reset Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* === MODAL 2: HAPUS AKUN === */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300" 
            title="Hapus Akun"
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Hapus Permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus akun <b>{userName}</b>. <br/>
              Tindakan ini tidak bisa dibatalkan dan data presensi terkait mungkin akan hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}