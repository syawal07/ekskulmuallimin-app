import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import LoginForm from "./login-form" 

export default async function LoginPage() {
  const profile = await prisma.companyProfile.findFirst()
  
  const logo = profile?.logoUrl || "/logo.png"
  
  // FIX GAMBAR JELEK: 
  // Jika tidak ada gambar dari admin, pakai gambar default arsitektur yang bagus dari Unsplash
  // Jangan pakai logo.png sebagai background karena pasti pecah/jelek
  const bgImage = profile?.loginImageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1986&auto=format&fit=crop"
  
  const quote = profile?.loginQuote || "Pendidikan adalah tiket ke masa depan."
  const author = profile?.loginQuoteAuthor || "Madrasah Mu'allimin"

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      
      {/* === TOMBOL KEMBALI (Navigasi) === */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 lg:text-white lg:hover:text-white/80 lg:hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Beranda
          </Button>
        </Link>
      </div>

      {/* === KOLOM KIRI (GAMBAR & QUOTE) === */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden h-full">
        
        {/* Layer 1: Background Image */}
        <Image 
          src={bgImage} 
          alt="Login Background" 
          fill 
          className="object-cover"
          priority
        />
        
        {/* Layer 2: Gradient Overlay (Biar Teks Terbaca & Mewah) */}
        {/* Menggunakan gradient hitam ke hijau tua, bukan hijau polos */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-slate-900/50 to-slate-900/30 z-10" />
        
        {/* Konten di atas Overlay */}
        <div className="relative z-20 flex items-center gap-3 font-medium text-lg">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-lg">
            <Image src={logo} alt="Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="tracking-wide text-white/90">Muallimin System</span>
        </div>

        <div className="relative z-20 mt-auto max-w-lg">
          <blockquote className="space-y-4">
            <p className="text-2xl font-medium leading-relaxed text-white">
              &ldquo;{quote}&rdquo;
            </p>
            <footer className="text-sm font-semibold text-emerald-200 uppercase tracking-widest">
              &mdash; {author}
            </footer>
          </blockquote>
        </div>
      </div>

      {/* === KOLOM KANAN (FORM LOGIN) === */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 bg-white p-3 rounded-2xl shadow-xl shadow-slate-200 mb-4 flex items-center justify-center">
               {/* Pastikan logo tampil proporsional */}
               <Image src={logo} alt="Logo" width={60} height={60} className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Selamat Datang</h1>
            <p className="text-sm text-slate-500">
              Masuk untuk mengakses dashboard pengajar
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
             <LoginForm /> 
          </div>

          <p className="text-center text-xs text-slate-400 px-8">
             &copy; {new Date().getFullYear()} Madrasah Mu&apos;allimin Muhammadiyah Yogyakarta.
          </p>
          
        </div>
      </div>
    </div>
  )
}