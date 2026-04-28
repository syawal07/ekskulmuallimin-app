'use client'

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2, Search, X, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { submitNews, deleteNews } from "@/actions/newsAction"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface NewsData {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  status: 'draft' | 'published';
  created_at: string;
}

const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  let baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BACKEND_URL || '';
  
  baseUrl = baseUrl.replace(/\/api$/, '');
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}

export default function AdminNewsClient({ initialData }: { initialData: NewsData[] }) {
  const [newsList, setNewsList] = useState<NewsData[]>(initialData)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [selectedNews, setSelectedNews] = useState<NewsData | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "draft"
  })
  
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredNews = newsList.filter(news => 
    news.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddModal = () => {
    setSelectedNews(null)
    setFormData({ title: "", content: "", status: "draft" })
    setPreviewImage(null)
    setIsModalOpen(true)
  }

  const openEditModal = (news: NewsData) => {
    setSelectedNews(news)
    setFormData({ title: news.title, content: news.content, status: news.status })
    setPreviewImage(news.image ? getImageUrl(news.image) : null)
    setIsModalOpen(true)
  }

  const openDeleteModal = (news: NewsData) => {
    setSelectedNews(news)
    setIsDeleteOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran foto terlalu besar! Maksimal 2MB.")
        e.target.value = ""
        return
      }
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const submitData = new FormData()
    submitData.append("title", formData.title)
    submitData.append("content", formData.content)
    submitData.append("status", formData.status)
    
    if (fileInputRef.current?.files?.[0]) {
      submitData.append("image", fileInputRef.current.files[0])
    }

    const res = await submitNews(submitData, selectedNews?.id)
    
    if (res?.error) {
      toast.error(res?.error)
    } else {
      toast.success(selectedNews ? "Berita berhasil diperbarui!" : "Berita berhasil ditambahkan!")
      setIsModalOpen(false)
      window.location.reload()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedNews) return
    setIsSubmitting(true)
    
    const res = await deleteNews(selectedNews.id)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Berita berhasil dihapus!")
      setIsDeleteOpen(false)
      window.location.reload()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari judul berita..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <Button onClick={openAddModal} className="w-full sm:w-auto bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> Tulis Berita Baru
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100">
                <TableRow>
                  <TableHead className="w-[80px] text-center font-bold">Foto</TableHead>
                  <TableHead className="font-bold">Judul Berita</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="font-bold">Tanggal Dibuat</TableHead>
                  <TableHead className="text-center font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNews.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-48 text-center text-slate-500">Belum ada berita yang dipublikasikan.</TableCell></TableRow>
                ) : (
                  filteredNews.map((news) => (
                    <TableRow key={news.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-center">
                        {news.image ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 mx-auto relative border">
                            <Image src={getImageUrl(news.image)} alt={news.title} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 mx-auto flex items-center justify-center border border-dashed border-slate-300">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-900 line-clamp-1">{news.title}</p>
                        <a href={`/berita/${news.slug}`} target="_blank" className="text-xs text-blue-500 hover:underline">/{news.slug}</a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={news.status === 'published' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                          {news.status === 'published' ? <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Tayang</span> : <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Draft</span>}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="icon" variant="outline" className="text-blue-600 bg-white" onClick={() => openEditModal(news)}>
                            <Edit className="w-4 h-4"/>
                          </Button>
                          <Button size="icon" variant="outline" className="text-red-600 bg-white hover:bg-red-50 hover:border-red-200" onClick={() => openDeleteModal(news)}>
                            <Trash2 className="w-4 h-4"/>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">{selectedNews ? "Edit Berita" : "Tulis Berita Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-md border"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="newsForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Judul Berita</label>
                      <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Tim Futsal Muallimin Juara 1 Tingkat Nasional" className="text-lg font-medium py-6" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Isi Berita</label>
                      <div className="border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2">
                          <Badge variant="secondary" className="font-normal text-xs text-slate-500">Editor Teks Standar</Badge>
                        </div>
                        <textarea 
                          required
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          placeholder="Tuliskan isi berita di sini..."
                          className="w-full min-h-[300px] p-4 focus:outline-none resize-y text-slate-700 leading-relaxed"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Status Publikasi</label>
                      <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published"><span className="font-medium text-emerald-600">Tayangkan (Published)</span></SelectItem>
                          <SelectItem value="draft"><span className="font-medium text-amber-600">Simpan Konsep (Draft)</span></SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">Status &quot;Tayang&quot; akan memunculkan berita di Halaman Depan.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 block">Foto Utama (Cover)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                        {previewImage ? (
                          <div className="w-full aspect-video relative rounded-lg overflow-hidden border">
                            <Image src={previewImage} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white font-medium text-sm flex items-center gap-2"><Edit className="w-4 h-4"/> Ganti Foto</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm font-medium">Klik untuk unggah foto</p>
                            <p className="text-xs mt-1">JPG, PNG (Maks 2MB)</p>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg" className="hidden" />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" form="newsForm" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 min-w-[120px]">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {selectedNews ? "Simpan Perubahan" : "Simpan Berita"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Hapus Berita Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus berita berjudul <b>&quot;{selectedNews?.title}&quot;</b> secara permanen. Foto yang terkait dengan berita ini juga akan dihapus dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Ya, Hapus Berita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}