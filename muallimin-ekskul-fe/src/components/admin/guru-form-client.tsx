'use client'

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createGuru, updateGuru } from "@/actions/guruAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, UserPlus, UserCog } from "lucide-react"
import Link from "next/link"

type Excul = {
  id: string
  name: string
}

type Mentor = {
  id: string
  name: string
  username: string
  mentoring_exculs: Excul[]
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]" 
      disabled={pending}
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
      {pending ? "Menyimpan..." : (isEdit ? "Update Guru" : "Simpan Guru")}
    </Button>
  )
}

export default function GuruFormClient({ exculs, mentor }: { exculs: Excul[], mentor?: Mentor | null }) {
  const isEditMode = !!mentor;
  const initialExculIds = mentor?.mentoring_exculs?.map(e => e.id) || [];
  
  const actionToUse = isEditMode 
    ? updateGuru.bind(null, mentor.id) 
    : createGuru;

  const [state, action] = useActionState(actionToUse, null)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/admin/guru">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? "Edit Data Guru" : "Tambah Guru Baru"}</h1>
          <p className="text-slate-500 text-sm">
            {isEditMode ? "Perbarui informasi akun dan penugasan." : "Buat akun dan tugaskan ke ekstrakurikuler."}
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
               {isEditMode ? <UserCog className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
             </div>
             <div>
               <CardTitle className="text-base text-slate-800">Form Data Akun</CardTitle>
               <CardDescription>Informasi login & penugasan mentor.</CardDescription>
             </div>
           </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {state?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
               ⚠️ <span className="font-medium">{state.error}</span>
            </div>
          )}

          <form action={action} className="space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap Pengajar</Label>
                <Input name="name" defaultValue={mentor?.name || ""} placeholder="Contoh: Budi Santoso, S.Kom" required className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label>Username Login</Label>
                <Input name="username" defaultValue={mentor?.username || ""} placeholder="Contoh: guru_futsal" required className="bg-white font-mono text-sm" />
                <p className="text-[11px] text-slate-400">Gunakan huruf kecil, tanpa spasi.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password {isEditMode && "(Kosongkan jika tidak diubah)"}</Label>
                  <Input type="password" name="password" placeholder="******" required={!isEditMode} className="bg-white" minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password</Label>
                  <Input type="password" name="confirmPassword" placeholder="******" required={!isEditMode} className="bg-white" minLength={6} />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-dashed border-slate-200">
                <Label className="text-emerald-700 font-semibold">Tugaskan ke Ekskul</Label>
                <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-md border border-slate-200 h-48 overflow-y-auto">
                    {exculs.map((excul) => (
                      <label key={excul.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                        <input 
                          type="checkbox" 
                          name="exculIds" 
                          value={excul.id} 
                          defaultChecked={initialExculIds.includes(excul.id)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-slate-700">{excul.name}</span>
                      </label>
                    ))}
                </div>
                <p className="text-[11px] text-slate-400">Pilih satu atau lebih ekskul yang diajarkan oleh guru ini.</p>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link href="/admin/guru">
                <Button variant="outline" type="button">Batal</Button>
              </Link>
              <SubmitButton isEdit={isEditMode} />
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}