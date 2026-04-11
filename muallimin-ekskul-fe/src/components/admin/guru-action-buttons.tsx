'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { KeyRound, Trash2, Loader2, Edit } from "lucide-react"
import { deleteGuru } from "@/actions/guruAction"
import { toast } from "sonner"
import Link from "next/link"
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

  const handleDelete = async () => {
    setLoading(true)
    const res = await deleteGuru(userId)
    setLoading(false)
    setOpenDelete(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Akun guru berhasil dihapus!")
    }
  }

  return (
    <div className="flex justify-center gap-2">
      <Link href={`/admin/guru/${userId}/edit`}>
          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50" title="Edit Akun">
            <Edit className="w-4 h-4" />
          </Button>
      </Link>

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