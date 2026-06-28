'use client'

import { useState, useActionState } from "react"
import { createGuru, updateGuru } from "@/actions/guruAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, CheckSquare } from "lucide-react"

export interface ExculItem {
  id: number | string;
  name: string;
}

export interface PerkaderanItem {
  id: number | string;
  nama_jenjang: string;
}

export interface GuruData {
  id: number | string;
  name: string;
  username: string;
  role: string;
  mentoring_exculs?: ExculItem[];
  mentoringExculs?: ExculItem[];
  perkaderans?: PerkaderanItem[];
}

export default function GuruFormClient({ 
  initialData, 
  exculs, 
  perkaderans 
}: { 
  initialData?: GuruData, 
  exculs: ExculItem[], 
  perkaderans: PerkaderanItem[] 
}) {
  const isEdit = !!initialData
  const action = isEdit && initialData ? updateGuru.bind(null, initialData.id.toString()) : createGuru
  const [state, formAction] = useActionState(action, null)
  
  const [role, setRole] = useState(initialData?.role || "MENTOR")
  
  const initialExculs = initialData?.mentoring_exculs?.map((e) => e.id.toString()) || initialData?.mentoringExculs?.map((e) => e.id.toString()) || []
  const initialPerkaderans = initialData?.perkaderans?.map((p) => p.id.toString()) || []
  
  const [selectedExculs, setSelectedExculs] = useState<string[]>(initialExculs)
  const [selectedPerkaderans, setSelectedPerkaderans] = useState<string[]>(initialPerkaderans)

  const toggleExcul = (id: string) => {
    setSelectedExculs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const togglePerkaderan = (id: string) => {
    setSelectedPerkaderans(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/guru">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEdit ? "Edit Data Guru" : "Tambah Guru Baru"}</h1>
          <p className="text-slate-500 text-sm">Formulir manajemen hak akses pembina</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input name="name" defaultValue={initialData?.name} required placeholder="Masukkan nama lengkap" />
            </div>

            <div className="space-y-2">
              <Label>Username</Label>
              <Input name="username" defaultValue={initialData?.username} required placeholder="Digunakan untuk login" />
            </div>

            <div className="space-y-2">
              <Label>Password {isEdit && <span className="text-xs text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}</Label>
              <Input type="password" name="password" required={!isEdit} placeholder="Minimal 6 karakter" />
            </div>

            <div className="space-y-2">
              <Label>Tipe Role (Hak Akses)</Label>
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="MENTOR">Pelatih Ekskul</option>
                <option value="PEMBINA">Pembina Perkaderan</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            {role === "MENTOR" ? (
              <div className="space-y-3">
                <Label className="text-base text-slate-800">Pilih Ekskul yang Diampu</Label>
                <p className="text-xs text-slate-500 mb-4">Guru hanya dapat mengakses data presensi dan nilai pada ekskul yang dicentang di bawah ini.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {exculs.map(ex => (
                    <label key={ex.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedExculs.includes(ex.id.toString()) ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                      <input 
                        type="checkbox" 
                        name="exculIds" 
                        value={ex.id.toString()}
                        checked={selectedExculs.includes(ex.id.toString())}
                        onChange={() => toggleExcul(ex.id.toString())}
                        className="hidden" 
                      />
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedExculs.includes(ex.id.toString()) ? 'bg-primary border-primary text-white' : 'bg-white border-slate-300'}`}>
                        {selectedExculs.includes(ex.id.toString()) && <CheckSquare className="w-3 h-3" />}
                      </div>
                      <span className={`text-sm font-medium ${selectedExculs.includes(ex.id.toString()) ? 'text-primary' : 'text-slate-700'}`}>{ex.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-base text-slate-800">Pilih Jenjang Perkaderan yang Dikawal</Label>
                <p className="text-xs text-slate-500 mb-4">Guru hanya dapat mengakses data presensi dan nilai pada jenjang yang dicentang di bawah ini.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {perkaderans.map(pk => (
                    <label key={pk.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPerkaderans.includes(pk.id.toString()) ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                      <input 
                        type="checkbox" 
                        name="perkaderanIds" 
                        value={pk.id.toString()}
                        checked={selectedPerkaderans.includes(pk.id.toString())}
                        onChange={() => togglePerkaderan(pk.id.toString())}
                        className="hidden" 
                      />
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedPerkaderans.includes(pk.id.toString()) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-300'}`}>
                        {selectedPerkaderans.includes(pk.id.toString()) && <CheckSquare className="w-3 h-3" />}
                      </div>
                      <span className={`text-sm font-medium ${selectedPerkaderans.includes(pk.id.toString()) ? 'text-amber-700' : 'text-slate-700'}`}>{pk.nama_jenjang}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {state?.error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {state.error}
            </div>
          )}

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <Button type="submit" size="lg" className="w-full md:w-auto px-8">
              Simpan Data Guru
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}