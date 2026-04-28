import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Users, Globe, MapPin, CheckCircle2, Sparkles, Camera } from "lucide-react"

export const dynamic = "force-dynamic"

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface CompanyProfileData {
  school_name: string | null;
  logo_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_description: string | null;
  hero_image_url: string | null;
  about_text: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

interface LandingData {
  exculCount: number;
  studentEnrollmentCount: number;
  profile: CompanyProfileData | null;
  galleries: GalleryItem[];
}

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  created_at: string;
}

async function getPublicNews(): Promise<NewsItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    if (!apiUrl) return [];
    
    const res = await fetch(`${apiUrl}/public/news`, { cache: 'no-store' });
    if (!res.ok) return [];
    
    const result = await res.json();
    return result.data || [];
  } catch (err) {
    return [];
  }
}

async function getLandingData(): Promise<LandingData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    if (!apiUrl) {
      return null;
    }

    const res = await fetch(`${apiUrl}/landing`, { cache: 'no-store' });
    
    if (!res.ok) {
      return null;
    }
    
    const result = await res.json();
    return result.data as LandingData;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// FUNGSI HELPER BARU UNTUK GAMBAR
const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BACKEND_URL || '';
  const cleanBase = storageUrl.endsWith('/') ? storageUrl.slice(0, -1) : storageUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export default async function LandingPage() {
  const data = await getLandingData();
  const news = await getPublicNews();

  const exculCount = data?.exculCount ?? 0;
  const studentEnrollmentCount = data?.studentEnrollmentCount ?? 0;
  const profile = data?.profile;
  const galleries = data?.galleries ?? [];

  const heroTitle = profile?.hero_title || "Wadah Kreativitas"
  const heroSubtitle = profile?.hero_subtitle || "Kader Pemimpin"
  const heroDesc = profile?.hero_description || "Platform manajemen ekstrakurikuler sekolah untuk memantau bakat siswa."
  const logo = profile?.logo_url ? getImageUrl(profile.logo_url) : "/logo.png"

  const schoolNameWords = profile?.school_name?.split(" ") || ["Madrasah", "Muallimin"]
  
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      
      {/* HEADER DIUBAH KE TEMA BIRU/KUNING */}
      <header className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl transition-all duration-300">
        <div className="container max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm p-1 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
              <Image 
                src={logo} 
                alt="Logo" 
                fill
                unoptimized 
                className="object-contain p-1" 
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 leading-none uppercase tracking-tighter">
                {profile?.school_name || "MUALLIMIN"} 
              </span>
              <span className="text-[10px] text-amber-500 font-bold tracking-[0.25em] mt-1">EKSTRAKURIKULER</span>
            </div>
          </div>

          <nav className="flex items-center gap-6 md:gap-10">
            <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
              <Link href="#about" className="hover:text-blue-600 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-amber-500 after:transition-all hover:after:w-full">Tentang</Link>
              <Link href="#stats" className="hover:text-blue-600 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-amber-500 after:transition-all hover:after:w-full">Statistik</Link>
              <Link href="#gallery" className="hover:text-blue-600 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-amber-500 after:transition-all hover:after:w-full">Galeri</Link>
            </div>
            <Link href="/login">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-full px-6 py-2 md:px-8 md:py-6 font-bold transition-all duration-300 shadow-[0_8px_30px_rgba(245,158,11,0.2)] hover:-translate-y-1">
                Portal SPMB <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        
        {/* HERO SECTION BIRU */}
        <section className="relative w-full min-h-screen flex items-center pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-multiply" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 mix-blend-multiply" />
          
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24 grid lg:grid-cols-2 gap-16 items-center relative z-10 mt-10 lg:mt-0">
            <div className="space-y-8 pl-0 lg:pl-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-800 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Sistem Presensi & Manajemen Digital
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-[5rem] font-black text-slate-900 leading-[1.05] tracking-tight uppercase">
                {heroTitle} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-700 inline-block mt-2">
                  {heroSubtitle}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                {heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                    Mulai Sekarang
                  </Button>
                </Link>
                <Link href="#about">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full text-slate-700 bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-bold transition-all duration-300">
                    Pelajari Dulu
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative mx-auto lg:ml-auto w-full max-w-[550px] animate-in fade-in slide-in-from-right-12 duration-1000 delay-200 fill-mode-both">
              <div className="relative aspect-[4/5] sm:aspect-square rounded-[3rem] bg-gradient-to-tr from-blue-100 to-white flex items-center justify-center shadow-2xl border-[8px] border-white ring-1 ring-slate-100/50 rotate-2 hover:rotate-0 transition-transform duration-700 overflow-hidden">
                {profile?.hero_image_url ? (
                  <Image 
                    src={getImageUrl(profile.hero_image_url)} 
                    alt="Hero" 
                    fill
                    unoptimized 
                    className="object-cover w-full h-full scale-105 hover:scale-110 transition-transform duration-1000" 
                    priority 
                  />
                ) : (
                  <Image 
                    src={logo} 
                    alt="Hero Fallback" 
                    width={280} 
                    height={280} 
                    unoptimized 
                    className="object-contain drop-shadow-2xl" 
                  />
                )}
                
                <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-white/90 backdrop-blur-xl p-5 md:p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 flex items-center gap-5 -rotate-3 hover:rotate-0 transition-all duration-300 cursor-default">
                  <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-3.5 rounded-2xl text-white shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-0.5">Status Sistem</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">Online 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="relative w-full -mt-24 md:-mt-32 z-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_80px_-15px_rgba(37,99,235,0.1)] border border-blue-50 p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center relative z-10">
                
                <div className="group space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                      {studentEnrollmentCount > 0 ? studentEnrollmentCount + "+" : "-"}
                    </h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Partisipan</p>
                  </div>
                </div>

                <div className="group space-y-4 relative before:absolute before:hidden md:before:block before:w-[1px] before:h-20 before:bg-slate-200 before:-left-6 before:top-1/2 before:-translate-y-1/2">
                  <div className="w-16 h-16 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                      {exculCount > 0 ? exculCount : "0"}
                    </h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Ekskul Aktif</p>
                  </div>
                </div>

                <div className="group space-y-4 relative before:absolute before:hidden md:before:block before:w-[1px] before:h-20 before:bg-slate-200 before:-left-6 before:top-1/2 before:-translate-y-1/2">
                  <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-sm">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">2</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Kampus</p>
                  </div>
                </div>

                <div className="group space-y-4 relative before:absolute before:hidden md:before:block before:w-[1px] before:h-20 before:bg-slate-200 before:-left-6 before:top-1/2 before:-translate-y-1/2">
                  <div className="w-16 h-16 mx-auto bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">1</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Sistem Terpadu</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-24 md:py-36 bg-[#FAFAFA] relative">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-5">
              <span className="text-amber-500 font-extrabold tracking-[0.2em] text-sm uppercase">Tentang Kami</span>
              <h2 className="text-4xl md:text-5xl font-black text-blue-900 leading-tight tracking-tight uppercase">Membangun Karakter Juara</h2>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed pt-2 whitespace-pre-line font-medium">
                {profile?.about_text || "Deskripsi program belum diatur oleh admin."}
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                { title: "Kampus Induk", desc: "Pusat pengembangan akademik dan keagamaan santri tingkat menengah di kawasan Wirobrajan.", color: "from-blue-600 to-indigo-600" },
                { title: "Kampus Terpadu", desc: "Fasilitas modern di Sedayu dengan lingkungan asri yang mendukung fokus belajar sains & teknologi.", color: "from-blue-500 to-sky-500" },
                { title: "Prestasi Tinggi", desc: "Program pembinaan intensif dan terstruktur untuk mencetak kader juara di berbagai level kompetisi.", color: "from-amber-500 to-orange-500" }
              ].map((item, i) => (
                <div key={i} className="group bg-white p-8 md:p-10 rounded-[2.5rem] border border-blue-50 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden z-10">
                  <div className="absolute top-0 right-0 p-8 text-[8rem] font-black text-slate-50 leading-none -z-10 transition-transform duration-500 group-hover:scale-110 group-hover:text-blue-50/50">
                    0{i+1}
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white font-black mb-8 text-xl shadow-lg`}>
                    {i+1}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="w-full py-24 md:py-32 bg-white">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-3">
                <span className="text-amber-500 font-extrabold tracking-[0.2em] text-sm uppercase">Informasi Terkini</span>
                <h2 className="text-4xl md:text-5xl font-black text-blue-900 tracking-tight uppercase">Berita & Update</h2>
              </div>
              <Link href="/public/news" className="hidden md:inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Lihat Semua Berita <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item) => (
                  <Link href={`/berita/${item.slug}`} key={item.id} className="group flex flex-col bg-white rounded-[2rem] border border-blue-50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                      {item.image ? (
                        <Image 
                          src={getImageUrl(item.image)} 
                          alt={item.title} 
                          fill 
                          unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                          <Globe className="w-12 h-12 text-blue-200" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-blue-900 shadow-sm border border-blue-100">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
                        {item.title}
                      </h3>
                      <div className="mt-auto inline-flex items-center text-amber-500 font-bold text-sm group-hover:translate-x-2 transition-transform duration-300">
                        Baca selengkapnya <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-blue-200 rounded-[2.5rem] bg-blue-50/50">
                <p className="text-slate-500 font-semibold text-lg">Belum ada berita yang dipublikasikan.</p>
              </div>
            )}
          </div>
        </section>

        <section id="gallery" className="w-full py-24 md:py-32 bg-blue-950">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-3">
                <span className="text-amber-400 font-extrabold tracking-[0.2em] text-sm uppercase">Dokumentasi</span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Galeri Kegiatan</h2>
              </div>
            </div>

            {galleries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gal) => (
                  <div key={gal.id} className="group relative aspect-square md:aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-800">
                    <Image 
                      src={getImageUrl(gal.image_url)} 
                      alt={gal.title} 
                      fill 
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="inline-block px-3 py-1 bg-amber-500 text-blue-950 text-[10px] font-extrabold rounded-full mb-3 uppercase tracking-widest shadow-lg">Sorotan</span>
                        <h4 className="text-white font-bold text-xl leading-snug tracking-tight">{gal.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-blue-800 rounded-[2.5rem] bg-blue-900/50">
                <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mb-6">
                    <Camera className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-blue-200 font-semibold text-lg">Belum ada dokumentasi kegiatan.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="w-full bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
          <div className="grid md:grid-cols-3 gap-12 mb-12 border-b border-slate-800/60 pb-12">
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white">
                <div className="relative w-12 h-12 bg-white/5 rounded-xl p-2 border border-white/10">
                  <Image 
                    src={logo} 
                    alt="Logo" 
                    fill 
                    unoptimized 
                    className="object-contain p-1 brightness-0 invert opacity-90" 
                  />
                </div>
                <span className="font-black text-2xl tracking-tight uppercase">Muallimin System</span>
              </div>
              <p className="leading-relaxed max-w-sm text-sm">
                <strong className="text-slate-200 uppercase">{profile?.school_name || "Madrasah Mu'allimin"}</strong> <br/>
                Mencetak Kader Ulama, Intelek, dan Pendidik Bangsa yang Berkemajuan.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg tracking-tight uppercase">Hubungi Kami</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{profile?.address || "Alamat sekolah belum diatur."}</span>
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>{profile?.email || "-"}</span>
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>{profile?.phone || "-"}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg tracking-tight uppercase">Akses Cepat</h4>
              <ul className="space-y-3 text-sm font-bold">
                {profile?.website && (
                  <li>
                    <Link href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors">
                      <Globe className="w-4 h-4" /> Website Resmi
                    </Link>
                  </li>
                )}
                <li><Link href="/login" className="text-slate-400 hover:text-amber-400 transition-colors">Portal Admin & Mentor</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-amber-400 transition-colors">Jadwal Ekstrakurikuler</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold tracking-wide">
            <p>&copy; {new Date().getFullYear()} Tim IT Muallimin. All rights reserved.</p>
            <p className="flex items-center gap-1.5">Dibuat dengan <span className="text-amber-500 text-sm">❤️</span> untuk pendidikan.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}