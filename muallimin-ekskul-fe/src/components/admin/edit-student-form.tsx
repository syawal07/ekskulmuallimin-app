'use client'

import { useActionState } from "react"
import { updateStudent } from "@/actions/studentAction"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SubmitButton from "@/components/admin/submit-button"

// Definisikan tipe agar TypeScript tidak error
type StudentData = {
  id: string
  name: string
  class: string
  nis: string | null
  exculId: string
}

type ExculData = {
  id: string
  name: string
}

export default function EditStudentForm({ 
  student, 
  exculs 
}: { 
  student: StudentData
  exculs: ExculData[] 
}) {
  // Kita perlu mengikat (bind) ID siswa ke fungsi update agar server tahu siapa yang diedit
  const updateStudentWithId = updateStudent.bind(null, student.id)
  
  // Gunakan useActionState untuk menangani respon dari server (sukses/gagal)
  const [state, formAction] = useActionState(updateStudentWithId, null)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
          ⚠️ {state.error}
        </div>
      )}

      {/* INPUT NAMA */}
      <div className="space-y-2">
        <Label>Nama Lengkap</Label>
        <Input 
          name="name" 
          defaultValue={student.name} 
          required 
          className="bg-slate-50 border-slate-200 focus:bg-white"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* INPUT KELAS */}
        <div className="space-y-2">
          <Label>Kelas</Label>
          <Input 
            name="class" 
            defaultValue={student.class} 
            required 
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
        {/* INPUT NIS */}
        <div className="space-y-2">
          <Label>NIS</Label>
          <Input 
            name="nis" 
            defaultValue={student.nis || ""} 
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      {/* INPUT EKSKUL */}
      <div className="space-y-2">
        <Label>Ekskul</Label>
        <Select name="exculId" defaultValue={student.exculId}>
          <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {exculs.map((ex) => (
              <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 flex justify-end">
        <SubmitButton>Simpan Perubahan</SubmitButton>
      </div>
    </form>
  )
}