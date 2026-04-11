'use client'

import { useState } from "react"
import { uploadGalleryImage } from "@/actions/galleryAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

export default function GalleryUploadForm() {
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar! Maksimal 5MB.")
      e.target.value = "" 
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    const res = await uploadGalleryImage(formData)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Foto berhasil ditambahkan ke galeri!")
      form.reset() 
    }

    setLoading(false)
  }

  return (
    <Card className="mb-8 border-dashed border-2 border-emerald-100 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800 text-lg">
          <Plus className="w-5 h-5" /> Tambah Foto Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          
          <div className="w-full md:w-1/3 space-y-2">
            <Label>Judul Kegiatan</Label>
            <Input name="title" placeholder="Contoh: Lomba Panahan Nasional" required className="bg-white" />
          </div>

          <div className="w-full md:w-1/3 space-y-2">
            <Label>File Foto</Label>
            <Input 
              type="file" 
              name="image" 
              accept="image/*" 
              required 
              className="bg-white cursor-pointer" 
              onChange={handleFileChange}
            />
            <p className="text-[10px] text-slate-500 mt-1">Max 5MB</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
            Upload
          </Button>
          
        </form>
      </CardContent>
    </Card>
  )
}