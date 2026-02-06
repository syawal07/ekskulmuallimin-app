import { prisma } from "@/lib/prisma"
import GalleryUploadForm from "@/components/admin/gallery-upload-form"
import GalleryCard from "@/components/admin/gallery-card"
import { Image as ImageIcon } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminGalleryPage() {
  // Ambil data galeri terbaru
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manajemen Galeri</h1>
        <p className="text-slate-600">Upload dokumentasi kegiatan ekstrakurikuler untuk ditampilkan di halaman depan.</p>
      </div>

      {/* Form Upload */}
      <GalleryUploadForm />

      {/* Daftar Foto */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" /> Daftar Foto ({galleries.length})
        </h2>

        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleries.map((item) => (
              <GalleryCard 
                key={item.id} 
                item={{
                  id: item.id,
                  title: item.title,
                  imageUrl: item.imageUrl,
                  date: item.createdAt
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 mb-4">
              <ImageIcon className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500">Belum ada foto di galeri.</p>
          </div>
        )}
      </div>
    </div>
  )
}