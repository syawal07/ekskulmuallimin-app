'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createPerkaderan, updatePerkaderan } from "@/actions/perkaderanAction"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Plus, Edit } from "lucide-react"

export interface Perkaderan {
  id: number;
  nama_jenjang: string;
  kategori: string;
  target_kelas: string;
  deskripsi: string | null;
}

export default function PerkaderanModal({ initialData }: { initialData?: Perkaderan }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isEdit = !!initialData

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let res
      if (isEdit && initialData) {
        res = await updatePerkaderan(initialData.id, null, formData)
      } else {
        res = await createPerkaderan(null, formData)
      }

      if (res?.success) {
        toast.success(isEdit ? "Data berhasil diperbarui" : "Data berhasil ditambahkan")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res?.error || "Terjadi kesalahan")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Jenjang
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Jenjang Perkaderan" : "Tambah Jenjang Perkaderan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nama_jenjang">Nama Jenjang</Label>
            <Input 
              id="nama_jenjang" 
              name="nama_jenjang" 
              defaultValue={initialData?.nama_jenjang} 
              required 
              placeholder="Contoh: Fortasi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <select
              id="kategori"
              name="kategori"
              defaultValue={initialData?.kategori || "Wajib"}
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Wajib">Wajib</option>
              <option value="Pendukung Utama">Pendukung Utama</option>
              <option value="Pendukung Khusus">Pendukung Khusus</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_kelas">Target Kelas</Label>
            <select
              id="target_kelas"
              name="target_kelas"
              defaultValue={initialData?.target_kelas || "Semua Kelas"}
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="1">Kelas 1</option>
              <option value="2">Kelas 2</option>
              <option value="3">Kelas 3</option>
              <option value="4">Kelas 4</option>
              <option value="5">Kelas 5</option>
              <option value="6">Kelas 6</option>
              <option value="Semua Kelas">Semua Kelas</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Input 
              id="deskripsi" 
              name="deskripsi" 
              defaultValue={initialData?.deskripsi || ""} 
              placeholder="Penjelasan singkat"
            />
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan Data"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}