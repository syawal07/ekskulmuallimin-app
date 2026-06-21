'use client'

import { useActionState } from "react"
import { updateStudent } from "@/actions/studentAction"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SubmitButton from "@/components/admin/submit-button"

type StudentData = {
  id: string
  name: string
  class: string
  nis: string | null
  nisn: string | null
  jenis_kelamin: string | null
  angkatan: string | null
  jabatan_organisasi: string | null
  is_active?: boolean
  exculId: string
  perkaderan_id?: number | null
}

type ExculData = {
  id: string
  name: string
}

type PerkaderanData = {
  id: number
  nama_jenjang: string
}

export default function EditStudentForm({ 
  student, 
  exculs,
  perkaderans
}: { 
  student: StudentData
  exculs: ExculData[]
  perkaderans: PerkaderanData[]
}) {
  const updateStudentWithId = updateStudent.bind(null, student.id)
  const [state, formAction] = useActionState(updateStudentWithId, null)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
          ⚠️ {state.error}
        </div>
      )}

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
        <div className="space-y-2">
          <Label>NIS</Label>
          <Input 
            name="nis" 
            defaultValue={student.nis || ""} 
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label>NISN</Label>
          <Input 
            name="nisn" 
            defaultValue={student.nisn || ""} 
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Kelas</Label>
          <Input 
            name="class" 
            defaultValue={student.class} 
            required 
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label>Angkatan</Label>
          <Input 
            name="angkatan" 
            defaultValue={student.angkatan || ""} 
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Jenis Kelamin</Label>
          <Select name="jenis_kelamin" defaultValue={student.jenis_kelamin || ""}>
            <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
              <SelectValue placeholder="-- Pilih Jenis Kelamin --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki (L)</SelectItem>
              <SelectItem value="P">Perempuan (P)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status Aktif</Label>
          <Select name="is_active" defaultValue={student.is_active === false ? "0" : "1"}>
            <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Aktif</SelectItem>
              <SelectItem value="0">Non-Aktif / Lulus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Jabatan Santri</Label>
          <Input 
            name="jabatan_organisasi" 
            defaultValue={student.jabatan_organisasi || ""} 
            placeholder="Contoh: Ketua Umum PRM / Anggota"
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label>Jenjang TKM Perkaderan</Label>
          <Select name="perkaderan_id" defaultValue={student.perkaderan_id?.toString() || ""}>
            <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
              <SelectValue placeholder="-- Pilih Tingkat TKM --" />
            </SelectTrigger>
            <SelectContent>
              {perkaderans.map((pk) => (
                <SelectItem key={pk.id} value={pk.id.toString()}>{pk.nama_jenjang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
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
        <div className="space-y-2">
          <Label>Perbarui Foto Profil</Label>
          <Input 
            type="file" 
            name="foto" 
            accept="image/png, image/jpeg, image/jpg"
            className="bg-slate-50 border-slate-200 focus:bg-white cursor-pointer"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <SubmitButton>Simpan Perubahan</SubmitButton>
      </div>
    </form>
  )
}