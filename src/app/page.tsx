import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Users, Globe, MapPin, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"


export default async function LandingPage() {
  const exculCount = await prisma.excul.count()
  const studentEnrollmentCount = await prisma.student.count()
  const profile = await prisma.companyProfile.findFirst()
  
  const galleries = await prisma.gallery.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' }
  })

  // Fallback data
  const heroTitle = profile?.heroTitle || "Wadah Kreativitas"
  const heroSubtitle = profile?.heroSubtitle || "Kader Pemimpin"
  const heroDesc = profile?.heroDescription || "Platform manajemen ekstrakurikuler sekolah untuk memantau bakat siswa."
  const logo = profile?.logoUrl || "/logo.png"

  // Helper untuk nama sekolah
  const schoolNameWords = profile?.schoolName?.split(" ") || ["Madrasah", "Muallimin"]
  const schoolBrand = schoolNameWords.length > 1 ? schoolNameWords[1] : schoolNameWords[0]

  // --- FIX LOGIKA URL WEBSITE ---
  const rawWebsite = profile?.website
  // Jika ada isinya, format ke URL valid. Jika kosong, biarkan string kosong.
  const websiteUrl = rawWebsite 
    ? (rawWebsite.startsWith("http") ? rawWebsite : `https://${rawWebsite}`)
    : ""

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="container max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
               <Image 
                 src={logo} 
                 alt="Logo" 
                 fill
                 className="object-contain transition-transform group-hover:scale-110" 
               />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-lg font-extrabold text-emerald-600 leading-none uppercase tracking-tight">
                {schoolBrand} 
              </span>
              <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em]">EKSTRAKURIKULER</span>
            </div>
          </div>

          <nav className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
              <Link href="#about" className="hover:text-emerald-600 transition-colors">Tentang</Link>
              <Link href="#stats" className="hover:text-emerald-600 transition-colors">Statistik</Link>
              <Link href="#gallery" className="hover:text-emerald-600 transition-colors">Galeri</Link>
            </div>
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 rounded-full px-6 py-2 md:px-8 md:py-6 font-bold transition-all hover:scale-105 active:scale-95">
                Login Pengajar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative w-full pt-20 pb-32 md:pt-32 md:pb-48 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8 pl-0 lg:pl-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/50 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                Sistem Presensi Digital
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                {heroTitle} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  {heroSubtitle}
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                {heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 font-bold transition-transform hover:-translate-y-1">
                    Mulai Sekarang
                  </Button>
                </Link>
                <Link href="#about">
                  <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-8 text-lg rounded-2xl text-slate-700 hover:bg-slate-100 font-semibold border border-slate-200">
                    Pelajari Dulu
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative mx-auto lg:ml-auto w-full max-w-[500px] animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center shadow-2xl border-[8px] border-white ring-1 ring-slate-100">
                {profile?.heroImageUrl ? (
                   <Image 
                   src={profile.heroImageUrl} 
                   alt="Hero" 
                   width={400} 
                   height={400} 
                   className="object-cover w-full h-full rounded-[2.5rem]" 
                   priority 
                 />
                ) : (
                  <Image 
                  src={logo} 
                  alt="Hero Fallback" 
                  width={250} 
                  height={250} 
                  className="object-contain drop-shadow-xl" 
                />
                )}
                
                <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 bg-white p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-4 animate-bounce hover:pause">
                   <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                     <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">System Status</p>
                      <p className="text-lg font-extrabold text-slate-900">Online 24/7</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTIK SECTION */}
        <section id="stats" className="relative w-full -mt-20 z-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x-0 md:divide-x divide-slate-100">
                
                <div className="group space-y-3">
                  <div className="w-14 h-14 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                      {studentEnrollmentCount > 0 ? studentEnrollmentCount + "+" : "-"}
                    </h3>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Partisipan</p>
                  </div>
                </div>

                <div className="group space-y-3">
                  <div className="w-14 h-14 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                      {exculCount > 0 ? exculCount : "0"}
                    </h3>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Ekskul Aktif</p>
                  </div>
                </div>

                <div className="group space-y-3">
                  <div className="w-14 h-14 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">2</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Kampus</p>
                  </div>
                </div>

                <div className="group space-y-3">
                  <div className="w-14 h-14 mx-auto bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">1</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Sistem Terpadu</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="w-full py-24 md:py-32 bg-white">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="text-emerald-600 font-bold tracking-widest text-sm uppercase bg-emerald-50 px-4 py-1.5 rounded-full">Tentang Kami</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">Membangun Karakter Juara</h2>
              <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full" />
              <p className="text-slate-600 text-lg leading-relaxed pt-4 whitespace-pre-line">
                {profile?.aboutText || "Deskripsi program belum diatur oleh admin."}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Kampus Induk", desc: "Pusat pengembangan akademik dan keagamaan santri tingkat menengah di kawasan Wirobrajan." },
                { title: "Kampus Terpadu", desc: "Fasilitas modern di Sedayu dengan lingkungan asri yang mendukung fokus belajar sains & teknologi." },
                { title: "Prestasi", desc: "Program pembinaan intensif dan terstruktur untuk mencetak kader juara di berbagai level kompetisi." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold mb-6 text-xl">
                    {i+1}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section id="gallery" className="w-full py-24 bg-slate-50">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <span className="text-emerald-600 font-bold tracking-widest text-sm uppercase">Dokumentasi</span>
                <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Galeri Kegiatan</h2>
              </div>
              <Button variant="outline" className="rounded-full px-6 border-slate-300 text-slate-700 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                 Lihat Semua
              </Button>
            </div>

            {galleries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleries.map((gal) => (
                  <div key={gal.id} className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-500 bg-slate-200">
                    <Image 
                      src={gal.imageUrl} 
                      alt={gal.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                      <div>
                        <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full mb-2 uppercase tracking-wide">Terbaru</span>
                        <h4 className="text-white font-bold text-lg leading-tight">{gal.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                   <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Belum ada dokumentasi kegiatan.</p>
                <p className="text-sm text-slate-400">Admin dapat menambahkan foto melalui dashboard.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-slate-950 text-slate-300 py-16 border-t border-slate-900">
        <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
          <div className="grid md:grid-cols-3 gap-12 mb-12 border-b border-slate-800 pb-12">
            
            {/* Kolom 1: Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-white">
                <div className="relative w-10 h-10">
                   <Image src={logo} alt="Logo" fill className="object-contain brightness-0 invert" />
                </div>
                <span className="font-extrabold text-xl tracking-tight">Muallimin System</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm text-sm">
                <strong>{profile?.schoolName}</strong> <br/>
                Mencetak Kader Ulama, Intelek, dan Pendidik Bangsa yang Berkemajuan.
              </p>
            </div>
            
            {/* Kolom 2: Kontak */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Hubungi Kami</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{profile?.address || "Alamat sekolah belum diatur."}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{profile?.email || "-"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{profile?.phone || "-"}</span>
                </li>
              </ul>
            </div>
            
            {/* Kolom 3: Link */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Akses Cepat</h4>
              <ul className="space-y-3 text-sm font-medium">
                
                {/* --- BAGIAN YANG DIPERBAIKI (CONDITIONAL RENDERING) --- */}
                {websiteUrl && (
                  <li>
                    <Link href={websiteUrl} target="_blank" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                      <Globe className="w-4 h-4" /> Website Resmi
                    </Link>
                  </li>
                )}
                
                <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Portal Admin & Mentor</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Jadwal Ekstrakurikuler</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-medium">
            <p>&copy; {new Date().getFullYear()} Tim IT Muallimin. All rights reserved.</p>
            <p className="flex items-center gap-1">Dibuat dengan <span className="text-red-500">❤️</span> untuk kemajuan pendidikan.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}