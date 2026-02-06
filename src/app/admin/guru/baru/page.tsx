'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createMentorUser } from "@/actions/authAction"
import { ArrowLeft, Save, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"

export default function AddGuruPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg("")

    const formData = new FormData(e.currentTarget)
    const res = await createMentorUser(formData)

    if (res?.error) {
      setErrorMsg(res.error)
      setIsSubmitting(false)
    }
    // Jika sukses, dia akan otomatis redirect oleh Server Action
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header & Tombol Kembali */}
      <div className="flex items-center gap-4">
        <Link href="/admin/guru">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Guru Baru</h1>
          <p className="text-slate-500 text-sm">Buat akun untuk pengajar ekstrakurikuler.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-800">Form Data Akun</CardTitle>
              <CardDescription>Informasi login untuk mentor.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 border border-red-100">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input 
                name="name" 
                placeholder="Contoh: Budi Santoso, S.Pd" 
                required 
                className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label>Username</Label>
              <Input 
                name="username" 
                placeholder="Contoh: guru_futsal" 
                required 
                className="bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400">Gunakan huruf kecil, tanpa spasi.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  type="password" 
                  name="password" 
                  placeholder="******" 
                  required 
                  minLength={6}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label>Konfirmasi Password</Label>
                <Input 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="******" 
                  required 
                  minLength={6}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="min-w-[140px] bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Simpan Guru</>
                )}
              </Button>
            </div>
          </form>

        </CardContent>
      </Card>
    </div>
  )
}