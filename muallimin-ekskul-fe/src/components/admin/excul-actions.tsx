'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteExcul } from "@/actions/exculAction"
import { toast } from "sonner"
import ExculModal from "./excul-modal"
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

export default function ExculActions({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await deleteExcul(id)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Ekskul berhasil dihapus")
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <ExculModal mode="edit" exculData={{ id, name }} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ekskul?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus ekskul <b>{name}</b>. Data tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}