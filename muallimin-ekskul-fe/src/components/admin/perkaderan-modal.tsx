'use client'

import { useActionState, useEffect } from "react"
import { createPerkaderan, updatePerkaderan } from "@/actions/perkaderanAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import SubmitButton from "@/components/admin/submit-button"

type PerkaderanData = {
  id: string | number
  nama_jenjang: string
  deskripsi: string | null
}

interface PerkaderanModalProps {
  isOpen: boolean
  onClose: () => void
  data: PerkaderanData | null
}

export default function PerkaderanModal({ isOpen, onClose, data }: PerkaderanModalProps) {
  const isEdit = !!data
  
  const actionToUse = isEdit ? updatePerkaderan.bind(null, data.id) : createPerkaderan
  const [state, formAction] = useActionState(actionToUse, null)

  useEffect(() => {
    if (state?.success) {
      onClose()
    }
  }, [state?.success, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Jenjang Perkaderan' : 'Tambah Jenjang Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Ubah informasi jenjang perkaderan di bawah ini.' : 'Masukkan nama dan deskripsi jenjang perkaderan baru.'}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 py-4">
          {state?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nama_jenjang">Nama Jenjang</Label>
            <Input 
              id="nama_jenjang"
              name="nama_jenjang" 
              placeholder="Contoh: TKM 1" 
              defaultValue={data?.nama_jenjang || ""}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
            <textarea 
              id="deskripsi"
              name="deskripsi" 
              placeholder="Penjelasan singkat mengenai jenjang ini..." 
              defaultValue={data?.deskripsi || ""}
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <SubmitButton>{isEdit ? 'Simpan Perubahan' : 'Tambah Jenjang'}</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}