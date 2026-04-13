import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, User, ChevronRight, Home } from "lucide-react"
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

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const news = await getNewsDetail(slug);

  if (!news) {
    notFound();
  }

  const imageUrl = news.image 
    ? `${process.env.NEXT_PUBLIC_API_BACKEND_URL?.replace('/api', '')}${news.image}` 
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-emerald-200 selection:text-emerald-900 font-sans">
      
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <Link href="/" className="hover:text-emerald-600 flex items-center transition-colors">
              <Home className="w-4 h-4 mr-1" /> Beranda
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
            <span className="text-slate-800 truncate max-w-[150px] sm:max-w-xs">{news.title}</span>
          </nav>
          
          <Link href="/">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <article className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="p-6 sm:p-10 md:p-16 pb-8 md:pb-12 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 mb-8 text-sm font-semibold text-slate-500">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Berita Terbaru
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {new Date(news.created_at).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Admin Sekolah
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-8">
              {news.title}
            </h1>

            <ShareButtons title={news.title} />
          </div>

          {imageUrl && (
            <div className="px-4 sm:px-10 md:px-16">
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl bg-slate-100 group">
                <Image 
                  src={imageUrl} 
                  alt={news.title} 
                  fill 
                  unoptimized
                  className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10 md:p-16 pt-10 md:pt-14">
            <div className="prose prose-lg md:prose-xl prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line
                prose-p:mb-6 
                first-letter:text-6xl first-letter:font-extrabold first-letter:text-emerald-600 first-letter:mr-2 first-letter:float-left first-letter:leading-none
                prose-a:text-emerald-600 prose-a:font-semibold hover:prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                prose-strong:text-slate-900 prose-strong:font-bold">
              {news.content}
            </div>
          </div>
          
        </article>
      </main>

      <footer className="w-full bg-slate-900 py-16 mt-10">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-1 bg-emerald-500 mx-auto mb-8 rounded-full" />
          <h3 className="text-2xl font-bold text-white mb-8">Terus Update dengan Prestasi Kami</h3>
          <Link href="/">
            <Button size="lg" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/50 h-14 px-8 text-lg font-bold transition-transform hover:-translate-y-1">
              Jelajahi Berita Lainnya
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}