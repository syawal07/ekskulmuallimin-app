import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, User, ChevronRight, Home, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import ShareButtons from "@/components/ui/share-buttons"

export const dynamic = "force-dynamic"

interface NewsDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  created_at: string;
}

async function getNewsDetail(slug: string): Promise<NewsDetail | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    if (!apiUrl) return null;

    const res = await fetch(`${apiUrl}/public/news/${slug}`, { cache: 'no-store' });
    
    if (!res.ok) return null;

    const result = await res.json();
    return result.data as NewsDetail;
  } catch (err: unknown) {
    return null;
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

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const news = await getNewsDetail(slug);

  if (!news) {
    notFound();
  }

  const imageUrl = news.image ? getImageUrl(news.image) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-blue-200 selection:text-blue-900 font-sans">
      
      {/* NAVIGASI ATAS */}
      <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <nav className="flex items-center text-sm font-bold text-slate-500">
            <Link href="/" className="hover:text-blue-600 flex items-center transition-colors">
              <Home className="w-4 h-4 mr-1.5" /> Beranda
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
            <span className="text-slate-800 truncate max-w-[150px] sm:max-w-xs">{news.title}</span>
          </nav>
          
          <Link href="/">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-full px-5">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16 relative">
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-100/50 blur-[80px] rounded-full -z-10 pointer-events-none" />

        <article className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.05)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
          
          <div className="p-6 sm:p-10 md:p-16 pb-8 md:pb-12 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8 text-sm font-bold text-slate-500">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full border border-amber-100 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="tracking-wide uppercase text-[11px]">Berita Resmi</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                {new Date(news.created_at).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                <User className="w-4 h-4 text-slate-400" />
                Admin Muallimin
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-10 uppercase">
              {news.title}
            </h1>

            <ShareButtons title={news.title} />
          </div>

          {imageUrl && (
            <div className="px-4 sm:px-10 md:px-16">
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-slate-100 group border border-slate-100">
                <Image 
                  src={imageUrl} 
                  alt={news.title} 
                  fill 
                  unoptimized
                  className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10 md:p-16 pt-12 md:pt-16">
            <div className="prose prose-lg md:prose-xl prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-line
                prose-p:mb-6 
                first-letter:text-[5rem] md:first-letter:text-[6.5rem] first-letter:font-black first-letter:text-amber-500 first-letter:mr-4 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-2
                prose-a:text-blue-600 prose-a:font-bold hover:prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                prose-strong:text-slate-900 prose-strong:font-black">
              {news.content}
            </div>
          </div>
          
        </article>
      </main>

      <footer className="w-full bg-slate-950 py-20 mt-16 md:mt-24 border-t border-slate-900">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-1.5 bg-amber-500 mx-auto mb-10 rounded-full" />
          <h3 className="text-3xl md:text-4xl font-black text-white mb-10 tracking-tight uppercase">Ikuti Terus Info Seputar Madrasah</h3>
          <Link href="/">
            <Button size="lg" className="rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-[0_10px_40px_rgba(37,99,235,0.3)] h-16 px-10 text-lg font-bold transition-all duration-300 hover:-translate-y-1">
              Jelajahi Berita Lainnya
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}