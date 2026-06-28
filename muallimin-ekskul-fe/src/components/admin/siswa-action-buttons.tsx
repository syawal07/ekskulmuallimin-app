'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, Pencil } from "lucide-react"
import { deleteStudent } from "@/actions/studentAction"
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
} from "@/components/ui/alert-dialog"

export default function SiswaActionButtons({ 
  studentId,
  studentName
}: { 
  studentId: string
  studentName: string
}) {
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await deleteStudent(studentId)
    setLoading(false)
    setShowDelete(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Data siswa berhasil dihapus")
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/siswa/${studentId}/edit`}>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors" 
          disabled={loading}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </Link>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setShowDelete(true)}
        className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors" 
        disabled={loading}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Siswa?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus data <b>{studentName}</b>. Tindakan ini akan menghapus seluruh relasi kepesertaan ekskul, perkaderan, beserta riwayat presensi dan nilainya secara permanen.
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
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ya, Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}