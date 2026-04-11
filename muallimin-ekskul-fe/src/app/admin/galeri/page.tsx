import GalleryUploadForm from "@/components/admin/gallery-upload-form"
import GalleryCard from "@/components/admin/gallery-card"
import { Image as ImageIcon } from "lucide-react"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

interface GalleryItem {
  id: string;
  title: string;
  image_url: string; // <-- PERBAIKAN: Sesuaikan dengan nama kolom dari database Laravel
  created_at: string;
}

async function getGalleries(): Promise<GalleryItem[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

  if (!token || !apiUrl) return [];

  try {
    const res = await fetch(`${apiUrl}/admin/galleries`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return [];
    const result = await res.json();
    return result.data as GalleryItem[];
  } catch (e) {
    return [];
  }
}

export default async function AdminGalleryPage() {
  const galleries = await getGalleries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manajemen Galeri</h1>
        <p className="text-slate-600">Upload dokumentasi kegiatan ekstrakurikuler untuk ditampilkan di halaman depan.</p>
      </div>

      <GalleryUploadForm />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" /> Daftar Foto ({galleries.length})
        </h2>

        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleries.map((item) => {
              const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL?.replace('/api', '') || '';
              const fullImageUrl = item.image_url ? `${backendUrl}${item.image_url}` : '';

              return (
                <GalleryCard 
                  key={item.id} 
                  item={{
                    id: item.id,
                    title: item.title,
                    imageUrl: fullImageUrl, 
                    date: new Date(item.created_at) 
                  }} 
                />
              )
            })}
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