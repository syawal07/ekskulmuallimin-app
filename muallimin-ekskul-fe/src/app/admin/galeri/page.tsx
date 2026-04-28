import GalleryUploadForm from "@/components/admin/gallery-upload-form"
import GalleryCard from "@/components/admin/gallery-card"
import { Image as ImageIcon, Sparkles } from "lucide-react"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

interface GalleryItem {
  id: string;
  title: string;
  image_url: string; 
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

// Fungsi Helper Gambar Anti-Badai
const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  let baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BACKEND_URL || '';
  
  baseUrl = baseUrl.replace(/\/api$/, '');
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}

export default async function AdminGalleryPage() {
  const galleries = await getGalleries();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Manajemen Galeri <Sparkles className="w-6 h-6 text-amber-500" />
        </h1>
        <p className="text-slate-500 font-medium">Upload dokumentasi kegiatan ekstrakurikuler untuk ditampilkan di halaman depan.</p>
      </div>

      <GalleryUploadForm />

      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
          <ImageIcon className="w-5 h-5 text-blue-600" /> Daftar Foto 
          <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full">{galleries.length}</span>
        </h2>

        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleries.map((item) => {
              return (
                <GalleryCard 
                  key={item.id} 
                  item={{
                    id: item.id,
                    title: item.title,
                    imageUrl: getImageUrl(item.image_url), 
                    date: new Date(item.created_at) 
                  }} 
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-white shadow-sm border border-slate-100 mb-4">
              <ImageIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada foto</h3>
            <p className="text-slate-500 font-medium">Upload foto pertama Anda menggunakan form di atas.</p>
          </div>
        )}
      </div>
    </div>
  )
}