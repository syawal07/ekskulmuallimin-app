'use client'

// 1. UPDATE IMPORT: Gunakan 'useActionState' dari 'react'
import { useActionState } from "react" 
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createStudent } from "@/actions/studentAction"
import SubmitButton from "@/components/admin/submit-button"

type ExculData = {
  id: string
  name: string
}

export default function CreateStudentForm({ exculs }: { exculs: ExculData[] }) {
  // 2. UPDATE HOOK: Ganti nama useFormState menjadi useActionState
  const [state, formAction] = useActionState(createStudent, null)

  return (
    <form action={formAction} className="space-y-5">
      
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
          ⚠️ {state.error}
        </div>
      )}

      {/* INPUT NAMA */}
      <div className="space-y-2">
        <Label>Nama Lengkap Siswa</Label>
        <Input 
          name="name" 
          placeholder="Contoh: Ahmad Dahlan" 
          required 
          className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* INPUT KELAS */}
        <div className="space-y-2">
          <Label>Kelas</Label>
          <Input 
            name="class" 
            placeholder="Contoh: 7A" 
            required 
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
        {/* INPUT NIS */}
        <div className="space-y-2">
          <Label>NIS (Opsional)</Label>
          <Input 
            name="nis" 
            placeholder="Nomor Induk..." 
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* PILIHAN EKSKUL (DROPDOWN) */}
      <div className="space-y-2">
        <Label>Pilih Ekstrakurikuler</Label>
        <Select name="exculId" required>
          <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
            <SelectValue placeholder="-- Pilih Ekskul --" />
          </SelectTrigger>
          <SelectContent>
            {exculs.length > 0 ? (
              exculs.map((ex) => (
                <SelectItem key={ex.id} value={ex.id}>
                  {ex.name}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-slate-500 text-center">
                Belum ada data ekskul.
              </div>
            )}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-slate-400">
          *Siswa wajib masuk ke salah satu ekskul.
        </p>
      </div>

      <div className="pt-4 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}