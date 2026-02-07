'use client'

import { useActionState } from "react" // Hook terbaru React 19/Next.js 15
import { useFormStatus } from "react-dom"
import { createMentorUser } from "@/actions/authAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"

// Tipe data Ekskul
type Excul = {
  id: string
  name: string
  location: "INDUK" | "TERPADU"
}

// Komponen Tombol Submit (Dipisah agar loading state berfungsi)
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]" 
      disabled={pending}
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
      {pending ? "Menyimpan..." : "Simpan Guru"}
    </Button>
  )
}

export default function GuruFormClient({ exculs }: { exculs: Excul[] }) {
  // Hook untuk menangani state form & server action
  const [state, action] = useActionState(createMentorUser, null)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header & Tombol Kembali */}
      <div className="flex items-center gap-4">
        <Link href="/admin/guru">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Guru Baru</h1>
          <p className="text-slate-500 text-sm">Buat akun dan tugaskan ke ekstrakurikuler.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
               <UserPlus className="w-5 h-5" />
             </div>
             <div>
               <CardTitle className="text-base text-slate-800">Form Data Akun</CardTitle>
               <CardDescription>Informasi login & penugasan mentor.</CardDescription>
             </div>
           </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          
          {/* Tampilkan Error Jika Ada (Misal: Username kembar) */}
          {state?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
               ⚠️ <span className="font-medium">{state.error}</span>
            </div>
          )}

          <form action={action} className="space-y-6">
            
            <div className="space-y-4">
              {/* Input Nama Lengkap */}
              <div className="space-y-2">
                <Label>Nama Lengkap Pengajar</Label>
                <Input name="name" placeholder="Contoh: Budi Santoso, S.Kom" required className="bg-white" />
              </div>

              {/* Input Username */}
              <div className="space-y-2">
                <Label>Username Login</Label>
                <Input name="username" placeholder="Contoh: guru_futsal" required className="bg-white font-mono text-sm" />
                <p className="text-[11px] text-slate-400">Gunakan huruf kecil, tanpa spasi.</p>
              </div>

              {/* Input Password & Confirm */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" name="password" placeholder="******" required className="bg-white" minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password</Label>
                  <Input type="password" name="confirmPassword" placeholder="******" required className="bg-white" minLength={6} />
                </div>
              </div>

              {/* DROPDOWN PILIH EKSKUL */}
              <div className="space-y-2 pt-4 border-t border-dashed border-slate-200">
                <Label className="text-emerald-700 font-semibold">Tugaskan ke Ekskul (Wajib)</Label>
                <div className="relative">
                  <select 
                    name="exculId" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Pilih Ekstrakurikuler --</option>
                    {exculs.map((excul) => (
                      <option key={excul.id} value={excul.id}>
                        {/* UPDATE: Hanya menampilkan Nama Ekskul (Tanpa Lokasi) agar sinkron dengan tabel */}
                        {excul.name} 
                      </option>
                    ))}
                  </select>
                  {/* Icon Panah Dropdown */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Guru ini akan otomatis menjadi pengampu ekskul yang dipilih.</p>
              </div>

            </div>

            {/* Footer Form: Tombol Batal & Simpan */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link href="/admin/guru">
                <Button variant="outline" type="button">Batal</Button>
              </Link>
              <SubmitButton />
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}