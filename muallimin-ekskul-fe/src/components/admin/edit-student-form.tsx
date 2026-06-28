'use client'

import { useActionState, useState } from "react"
import { updateStudent } from "@/actions/studentAction"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SubmitButton from "@/components/admin/submit-button"
import { CheckSquare } from "lucide-react"

type ExculData = {
  id: string
  name: string
}

type PerkaderanData = {
  id: number
  nama_jenjang: string
}

type PerkaderanRelation = {
  id: number;
  perkaderan_id: number;
  status: string;
  jabatan: string;
}

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
  exculs?: ExculData[]
  perkaderans?: PerkaderanRelation[]
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

  const initialExculs = student.exculs?.map(e => e.id) || []
  const initialPerkaderans = student.perkaderans?.filter(p => p.status === 'Aktif').map(p => p.perkaderan_id.toString()) || []
  const initialJabatanPk = student.perkaderans?.find(p => p.status === 'Aktif')?.jabatan || ""

  const [selectedExculs, setSelectedExculs] = useState<string[]>(initialExculs)
  const [selectedPerkaderans, setSelectedPerkaderans] = useState<string[]>(initialPerkaderans)

  const toggleExcul = (id: string) => {
    setSelectedExculs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const togglePerkaderan = (id: string) => {
    setSelectedPerkaderans(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <form action={formAction} className="space-y-6">
      
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
          ⚠️ {state.error}
        </div>
      )}

      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Informasi Biodata Induk</h3>
        <div className="space-y-2">
          <Label>Nama Lengkap Siswa</Label>
          <Input 
            name="name" 
            defaultValue={student.name}
            required 
            className="bg-white"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Kelas</Label>
            <Input 
              name="class" 
              defaultValue={student.class}
              required 
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>NIS (Opsional)</Label>
            <Input 
              name="nis" 
              defaultValue={student.nis || ""}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>NISN (Opsional)</Label>
            <Input 
              name="nisn" 
              defaultValue={student.nisn || ""}
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Jenis Kelamin</Label>
            <Select name="jenis_kelamin" defaultValue={student.jenis_kelamin || ""}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Pilih..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki (L)</SelectItem>
                <SelectItem value="P">Perempuan (P)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Angkatan (Opsional)</Label>
            <Input 
              name="angkatan" 
              defaultValue={student.angkatan || ""}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Jabatan Organisasi (Opsional)</Label>
            <Input 
              name="jabatan_organisasi" 
              defaultValue={student.jabatan_organisasi || ""}
              className="bg-white"
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status Akademik</Label>
            <Select name="is_active" defaultValue={student.is_active === false ? "0" : "1"}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Siswa Aktif</SelectItem>
                <SelectItem value="0">Non-Aktif / Lulus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Perbarui Foto Profil (Opsional)</Label>
            <Input 
              type="file" 
              name="foto" 
              accept="image/png, image/jpeg, image/jpg"
              className="bg-white cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
        <h3 className="font-bold text-blue-900 text-sm border-b border-blue-200 pb-2">Pemilihan Ekstrakurikuler</h3>
        <p className="text-xs text-blue-600">Perbarui ekskul yang diikuti siswa pada tahun ajaran ini.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {exculs.map(ex => (
            <label key={ex.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedExculs.includes(ex.id) ? 'bg-white border-blue-400 shadow-sm' : 'bg-white/50 border-blue-100 hover:bg-white'}`}>
              <input 
                type="checkbox" 
                name="exculId" 
                value={ex.id}
                checked={selectedExculs.includes(ex.id)}
                onChange={() => toggleExcul(ex.id)}
                className="hidden" 
              />
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${selectedExculs.includes(ex.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                {selectedExculs.includes(ex.id) && <CheckSquare className="w-3 h-3" />}
              </div>
              <span className={`text-sm font-medium ${selectedExculs.includes(ex.id) ? 'text-blue-700' : 'text-slate-600'}`}>{ex.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-4">
        <h3 className="font-bold text-amber-900 text-sm border-b border-amber-200 pb-2">Pemilihan Jenjang Perkaderan (TKM)</h3>
        <p className="text-xs text-amber-600">Perbarui jenjang dan jabatan TKM yang diikuti siswa.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {perkaderans.map(pk => (
            <label key={pk.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPerkaderans.includes(pk.id.toString()) ? 'bg-white border-amber-400 shadow-sm' : 'bg-white/50 border-amber-100 hover:bg-white'}`}>
              <input 
                type="checkbox" 
                name="perkaderanIds" 
                value={pk.id.toString()}
                checked={selectedPerkaderans.includes(pk.id.toString())}
                onChange={() => togglePerkaderan(pk.id.toString())}
                className="hidden" 
              />
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${selectedPerkaderans.includes(pk.id.toString()) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-300'}`}>
                {selectedPerkaderans.includes(pk.id.toString()) && <CheckSquare className="w-3 h-3" />}
              </div>
              <span className={`text-sm font-medium ${selectedPerkaderans.includes(pk.id.toString()) ? 'text-amber-700' : 'text-slate-600'}`}>{pk.nama_jenjang}</span>
            </label>
          ))}
        </div>
        {selectedPerkaderans.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t border-amber-200/50">
            <Label className="text-amber-800">Jabatan di Perkaderan / TKM</Label>
            <Input 
              name="jabatan_perkaderan" 
              defaultValue={initialJabatanPk}
              placeholder="Contoh: Ketua Kafilah / Peserta (Opsional)" 
              className="bg-white border-amber-200 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <SubmitButton>Simpan Perubahan Data</SubmitButton>
      </div>
    </form>
  )
}