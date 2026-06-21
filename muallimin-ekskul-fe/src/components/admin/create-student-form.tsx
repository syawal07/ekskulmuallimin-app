'use client'

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

type PerkaderanData = {
  id: number
  nama_jenjang: string
}

export default function CreateStudentForm({ 
  exculs, 
  perkaderans 
}: { 
  exculs: ExculData[],
  perkaderans: PerkaderanData[]
}) {
  const [state, formAction] = useActionState(createStudent, null)

  return (
    <form action={formAction} className="space-y-5">
      
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
          ⚠️ {state.error}
        </div>
      )}

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
        <div className="space-y-2">
          <Label>NIS</Label>
          <Input 
            name="nis" 
            placeholder="Nomor Induk Siswa..." 
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label>NISN (Opsional)</Label>
          <Input 
            name="nisn" 
            placeholder="Nomor Induk Siswa Nasional..." 
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Kelas</Label>
          <Input 
            name="class" 
            placeholder="Contoh: 7A" 
            required 
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label>Angkatan (Opsional)</Label>
          <Input 
            name="angkatan" 
            placeholder="Contoh: 2024" 
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Jenis Kelamin</Label>
          <Select name="jenis_kelamin">
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
          <Label>Jabatan Santri (Opsional)</Label>
          <Input 
            name="jabatan_organisasi" 
            placeholder="Contoh: Ketua Umum PRM" 
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Pilih Ekstrakurikuler Utama</Label>
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
        </div>
        <div className="space-y-2">
          <Label>Jenjang TKM Perkaderan (Opsional)</Label>
          <Select name="perkaderan_id">
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

      <div className="space-y-2">
        <Label>Foto Profil (Opsional)</Label>
        <Input 
          type="file" 
          name="foto" 
          accept="image/png, image/jpeg, image/jpg"
          className="bg-slate-50 border-slate-200 focus:bg-white transition-all cursor-pointer"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}