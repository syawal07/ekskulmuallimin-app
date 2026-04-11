'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, Pencil } from "lucide-react"
import { deleteStudent } from "@/actions/studentAction"
import { toast } from "sonner"
import Link from "next/link" // <--- Wajib Import ini
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

export default function SiswaActionButtons({ 
  studentId, 
  studentName 
}: { 
  studentId: string
  studentName: string 
}) {
  const [loading, setLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await deleteStudent(studentId)
    setLoading(false)
    setOpenDelete(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Data siswa berhasil dihapus")
    }
  }

  return (
    <div className="flex justify-end gap-2">
      
      {/* --- BAGIAN EDIT (YANG TADI BELUM JALAN) --- */}
      <Link href={`/admin/siswa/${studentId}/edit`}>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50" 
          disabled={loading}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </Link>
      {/* ------------------------------------------- */}

      {/* Bagian Delete (Sudah aman) */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300" 
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Siswa?</AlertDialogTitle>
            <AlertDialogDescription>
              Siswa <b>{studentName}</b> akan dihapus permanen.
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}