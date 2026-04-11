'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createExcul, updateExcul } from "@/actions/exculAction"
import { toast } from "sonner"
import { Loader2, Plus, Pencil } from "lucide-react"

interface ExculModalProps {
  mode: "create" | "edit"
  exculData?: { id: string; name: string }
}

export default function ExculModal({ mode, exculData }: ExculModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    let res
    if (mode === "create") {
      res = await createExcul(formData)
    } else {
      if (!exculData?.id) return
      res = await updateExcul(exculData.id, formData)
    }

    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(mode === "create" ? "Ekskul berhasil dibuat" : "Ekskul berhasil diupdate")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Tambah Ekskul
          </Button>
        ) : (
          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Ekskul Baru" : "Edit Nama Ekskul"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Ekskul</Label>
            <Input
              id="name"
              name="name"
              defaultValue={exculData?.name}
              placeholder="Contoh: Robotik, Futsal..."
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Simpan" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}