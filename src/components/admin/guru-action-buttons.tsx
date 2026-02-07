'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { KeyRound, Trash2, Loader2 } from "lucide-react"
import { deleteMentor, resetMentorPassword } from "@/actions/authAction"
import { toast } from "sonner"
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
} from "@/components/ui/alert-dialog"

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
    setOpenDelete(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Akun guru berhasil dihapus!")
    }
  }

  // HANDLER: RESET PASSWORD
  const handleReset = async () => {
    setLoading(true)
    const res = await resetMentorPassword(userId)
    setLoading(false)
    setOpenReset(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
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
      {/* Modal Reset Password */}
      <AlertDialog open={openReset} onOpenChange={setOpenReset}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 text-orange-600 border-orange-200 hover:bg-orange-50" title="Reset Password" disabled={loading}>
            <KeyRound className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
            <AlertDialogDescription>Password <b>{userName}</b> akan jadi <b>password123</b>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleReset() }} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Hapus */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" title="Hapus Akun" disabled={loading}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Permanen?</AlertDialogTitle>
            <AlertDialogDescription>Anda akan menghapus akun <b>{userName}</b>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete() }} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}