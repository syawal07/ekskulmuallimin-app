'use client'

import { useState } from "react"
import { updateCompanyProfile } from "@/actions/settingAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, School, Globe, ImageIcon, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

const MAX_FILE_SIZE = 5 * 1024 * 1024 

export interface CompanyProfile {
  school_name?: string;
  logo_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  hero_image_url?: string;
  about_text?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  login_image_url?: string;
  login_quote?: string;
  login_quote_author?: string;
}

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <div className="flex justify-end pt-4 border-t border-slate-100">
      <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[140px]" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Simpan Tab Ini
      </Button>
    </div>
  )
}

export default function SchoolProfileForm({ initialData }: { initialData: CompanyProfile }) {
  const [loading, setLoading] = useState(false)

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const storageUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_BACKEND_URL || '').replace(/\/api$/, '');
    const cleanBase = storageUrl.endsWith('/') ? storageUrl.slice(0, -1) : storageUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Ukuran file terlalu besar! Maksimal 5MB.")
        e.target.value = "" 
      }
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const res = await updateCompanyProfile(formData)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Perubahan berhasil disimpan!")
    }
    setLoading(false)
  }

  return (
    <Tabs defaultValue="branding" className="w-full space-y-6">
      
      <div className="flex items-center justify-between">
         <TabsList className="grid w-full max-w-2xl grid-cols-4 h-auto p-1 bg-slate-100">
            <TabsTrigger value="branding" className="py-2">Identitas</TabsTrigger>
            <TabsTrigger value="landing" className="py-2">Landing Page</TabsTrigger>
            <TabsTrigger value="login" className="py-2">Halaman Login</TabsTrigger>
            <TabsTrigger value="contact" className="py-2">Kontak</TabsTrigger>
         </TabsList>
      </div>

      <TabsContent value="branding">
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><School className="w-5 h-5 text-primary" /> Identitas Sekolah</CardTitle>
              <CardDescription>Nama sekolah dan logo utama.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Sekolah</Label>
                <Input name="school_name" defaultValue={initialData.school_name || ""} required />
              </div>
              <div className="space-y-2">
                <Label>Logo Sekolah</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center bg-slate-50 hover:bg-slate-100 transition">
                  {initialData.logo_url && (
                    <img src={getImageUrl(initialData.logo_url)} alt="Logo" className="h-16 mx-auto mb-2 object-contain" />
                  )}
                  <input 
                    type="file" 
                    name="logo" 
                    accept="image/*" 
                    className="text-xs text-slate-500 mx-auto" 
                    onChange={handleFileChange} 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Maksimal 5MB (PNG/JPG)</p>
                </div>
              </div>
              <SaveButton loading={loading} />
            </CardContent>
          </Card>
        </form>
      </TabsContent>

      <TabsContent value="landing">
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Hero Section</CardTitle>
              <CardDescription>Konten halaman depan website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Judul Besar</Label>
                  <Input name="hero_title" defaultValue={initialData.hero_title || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Sub-Judul</Label>
                  <Input name="hero_subtitle" defaultValue={initialData.hero_subtitle || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Singkat</Label>
                <textarea name="hero_description" defaultValue={initialData.hero_description || ""} className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                  <Label>Foto Banner (Background)</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                    {initialData.hero_image_url && (
                      <img src={getImageUrl(initialData.hero_image_url)} alt="Hero" className="h-32 mx-auto mb-2 object-cover rounded-md" />
                    )}
                    <input 
                      type="file" 
                      name="heroImage" 
                      accept="image/*" 
                      className="text-xs text-slate-500 mx-auto"
                      onChange={handleFileChange}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Maksimal 5MB</p>
                  </div>
              </div>
              <div className="space-y-2">
                  <Label>Tentang Sekolah</Label>
                  <textarea name="about_text" defaultValue={initialData.about_text || ""} className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <SaveButton loading={loading} />
            </CardContent>
          </Card>
        </form>
      </TabsContent>

      <TabsContent value="login">
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Halaman Login</CardTitle>
              <CardDescription>Kustomisasi tampilan login pengajar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Gambar Background</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                  {initialData.login_image_url && (
                    <img src={getImageUrl(initialData.login_image_url)} alt="Login Bg" className="h-40 w-full mx-auto mb-2 object-cover rounded-md opacity-80" />
                  )}
                  <input 
                    type="file" 
                    name="loginImage" 
                    accept="image/*" 
                    className="text-xs text-slate-500 mx-auto"
                    onChange={handleFileChange}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Maksimal 5MB (Disarankan gambar Portrait)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Kutipan Motivasi</Label>
                <textarea name="login_quote" defaultValue={initialData.login_quote || ""} className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <Label>Tokoh / Penulis</Label>
                <Input name="login_quote_author" defaultValue={initialData.login_quote_author || ""} />
              </div>
              <SaveButton loading={loading} />
            </CardContent>
          </Card>
        </form>
      </TabsContent>

      <TabsContent value="contact">
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Kontak & Alamat</CardTitle>
              <CardDescription>Info kontak di footer website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telepon / WA</Label>
                  <Input name="phone" defaultValue={initialData.phone || ""} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" defaultValue={initialData.email || ""} type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input name="website" defaultValue={initialData.website || ""} />
              </div>
              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <textarea name="address" defaultValue={initialData.address || ""} className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <SaveButton loading={loading} />
            </CardContent>
          </Card>
        </form>
      </TabsContent>

    </Tabs>
  )
}