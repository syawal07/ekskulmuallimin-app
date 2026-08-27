import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Users, Globe, MapPin, CheckCircle2, Sparkles, Camera, BookOpen, ChevronRight, FileText } from "lucide-react"

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
  guide_pdf_url: string | null;
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
    
    const res = await fetch(`${apiUrl}/public/news`, { next: { revalidate: 60 } });
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
    
    const res = await fetch(`${apiUrl}/landing`, { next: { revalidate: 60 } });
    
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

const getImageUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  let baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BACKEND_URL || '';
  
  baseUrl = baseUrl.replace(/\/api$/, '');
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}

export default async function LandingPage() {
  const data = await getLandingData();
  const news = await getPublicNews();

  const exculCount = data?.exculCount ?? 0;
  const studentEnrollmentCount = data?.studentEnrollmentCount ?? 0;
  const profile = data?.profile;
  const galleries = data?.galleries ?? [];

  const heroTitle = profile?.hero_title || "SPMB Madrasah"
  const heroSubtitle = profile?.hero_subtitle || "Mu'allimin Muhammadiyah"
  const heroDesc = profile?.hero_description || "Platform terpadu untuk pendaftaran siswa baru dan manajemen kegiatan ekstrakurikuler."
  
  const logo = profile?.logo_url ? getImageUrl(profile.logo_url) : "/logo.png"

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans selection:bg-amber-200 selection:text-blue-900 overflow-x-hidden">
      
      <header className="absolute top-0 z-50 w-full border-b border-white/10 bg-blue-700/90 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full p-1.5 flex items-center justify-center shadow-sm">
              <Image 
                src={logo} 
                alt="Logo" 
                width={40}
                height={40}
                unoptimized 
                className="object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-white leading-tight tracking-tight">
                {profile?.school_name || "Madrasah Mu'allimin Muhammadiyah Yogyakarta"}
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6 md:gap-10">
            <div className="hidden lg:flex gap-8 text-sm font-semibold text-blue-50">
              <Link href="#about" className="hover:text-amber-400 transition-colors">Beranda</Link>
              <Link href="#gallery" className="hover:text-amber-400 transition-colors">Galeri</Link>
              <Link href="#news" className="hover:text-amber-400 transition-colors">Berita</Link>
            </div>
            <Link href="/login">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg px-6 md:px-8 font-bold transition-all duration-300 shadow-sm">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        
        <section className="relative w-full min-h-screen flex items-center pt-32 pb-32 md:pb-48 bg-blue-700 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
          
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            
            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-8 bg-amber-400" />
                <span className="text-amber-400 font-bold tracking-[0.2em] text-xs uppercase">Selamat Datang Di</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-[4rem] lg:text-[4.5rem] font-bold text-white leading-[1.1] tracking-tight">
                {heroTitle} <br/>
                {heroSubtitle}
              </h1>
              
              <p className="text-base md:text-lg text-blue-100/90 max-w-lg leading-relaxed font-medium">
                {heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-xl bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold transition-all duration-300 hover:-translate-y-1">
                    Login Pelatih<ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#about">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base rounded-xl text-white bg-transparent border border-white/30 hover:bg-white/10 font-bold transition-all duration-300">
                    Tentang Kami
                  </Button>
                </Link>
                {profile?.guide_pdf_url && (
                  <a href={getImageUrl(profile.guide_pdf_url)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base rounded-xl text-white bg-white/10 border border-white/30 hover:bg-white/20 font-bold transition-all duration-300">
                      <FileText className="mr-2 w-4 h-4" /> Panduan Sistem
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <div className="relative mx-auto lg:ml-auto w-full max-w-[500px] lg:max-w-[550px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="absolute -top-6 -right-6 w-24 h-24 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl hidden md:block" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl hidden md:block" />
              
              <div className="relative aspect-[4/5] rounded-3xl bg-blue-800 shadow-2xl overflow-hidden group">
                {profile?.hero_image_url ? (
                  <Image 
                    src={getImageUrl(profile.hero_image_url)} 
                    alt="Hero" 
                    fill
                    unoptimized 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-1000" 
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-blue-800">
                    <Image 
                      src={logo} 
                      alt="Hero Fallback" 
                      width={200} 
                      height={200} 
                      unoptimized 
                      className="object-contain opacity-50 grayscale mix-blend-screen" 
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-8 right-4 md:-bottom-10 md:right-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="bg-amber-400 p-3 rounded-xl text-slate-900">
                  <Users className="w-6 h-6" />
                </div>
                <div className="pr-4">
                  <p className="text-xl font-black text-slate-900 tracking-tight leading-none">1000+</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">Kader Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="relative w-full -mt-16 md:-mt-24 z-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center relative z-10 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                <div className="group flex flex-col items-center justify-center pt-4 md:pt-0">
                  <div className="text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                    {studentEnrollmentCount > 0 ? studentEnrollmentCount + "+" : "-"}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Partisipan</p>
                </div>

                <div className="group flex flex-col items-center justify-center pt-8 md:pt-0">
                  <div className="text-amber-500 mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                    {exculCount > 0 ? exculCount : "0"}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ekskul Aktif</p>
                </div>

                <div className="group flex flex-col items-center justify-center pt-8 md:pt-0">
                  <div className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">2</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kampus</p>
                </div>

                <div className="group flex flex-col items-center justify-center pt-8 md:pt-0">
                  <div className="text-indigo-500 mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">1</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Portal Terpadu</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-24 md:py-32 bg-[#F8FAFC] relative">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="text-amber-500 font-bold tracking-[0.2em] text-sm uppercase">Tentang Platform</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">Ekosistem Pendidikan Berkemajuan</h2>
              <p className="text-slate-500 text-lg leading-relaxed whitespace-pre-line font-medium max-w-2xl mx-auto pt-2">
                {profile?.about_text || "Deskripsi program belum diatur oleh admin."}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                { title: "Kampus Induk", desc: "Pusat pengembangan akademik dan keagamaan di kawasan Wirobrajan.", icon: BookOpen },
                { title: "Kampus Terpadu", desc: "Fasilitas modern di Sedayu dengan lingkungan asri pendukung sains & teknologi.", icon: Globe },
                { title: "Kader Juara", desc: "Sistem monitoring talenta terstruktur untuk melahirkan generasi emas Muhammadiyah.", icon: Trophy }
              ].map((item, i) => (
                <div key={i} className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {news.length > 0 && (
          <section id="news" className="w-full py-24 bg-white relative">
            <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                <div className="max-w-2xl space-y-4">
                  <span className="text-blue-600 font-bold tracking-[0.2em] text-sm uppercase">Kabar Terbaru</span>
                  <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">Berita & Informasi</h2>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {news.map((item) => (
                  <Link href={`/berita/${item.slug}`} key={item.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="aspect-[16/10] relative bg-slate-100 overflow-hidden">
                      {item.image ? (
                        <Image 
                          src={getImageUrl(item.image)} 
                          alt={item.title} 
                          fill
                          unoptimized 
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <p className="text-sm font-bold text-blue-600 mb-3">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                      <div className="mt-auto flex items-center text-sm font-bold text-slate-500 group-hover:text-amber-500 transition-colors">
                        Baca Selengkapnya <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="gallery" className="w-full py-24 bg-[#072657] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
          
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="text-amber-400 font-bold tracking-[0.2em] text-sm uppercase">Dokumentasi</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">Galeri Kegiatan</h2>
              <p className="text-blue-200 text-lg">Potret semangat dan prestasi kader Madrasah Mu&apos;allimin.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {galleries.length > 0 ? (
                galleries.map((img) => (
                  <div key={img.id} className="group relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-blue-800">
                    <Image 
                      src={getImageUrl(img.image_url)} 
                      alt={img.title} 
                      fill 
                      unoptimized 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#072657]/90 via-[#072657]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white font-bold text-lg md:text-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.title}</h3>
                      <p className="text-blue-200 text-sm mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        {new Date(img.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center flex flex-col items-center">
                  <Camera className="w-16 h-16 text-blue-800 mb-4" />
                  <p className="text-blue-400 font-medium">Belum ada foto galeri.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="w-full py-24 bg-white relative">
          <div className="container max-w-4xl mx-auto px-6 text-center">
            <div className="bg-amber-400 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Siap Memulai Evaluasi?</h2>
                <p className="text-lg text-slate-800 font-medium max-w-xl mx-auto">
                  Akses portal pengajar untuk melakukan presensi, input nilai, dan memantau perkembangan santri secara menyeluruh.
                </p>
                <Link href="/login" className="inline-block">
                  <Button size="lg" className="h-16 px-10 text-lg rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold transition-all duration-300 hover:scale-105 shadow-xl">
                    Masuk ke Sistem Pengajar <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-white/5">
        <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16 grid md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full p-1.5 flex items-center justify-center">
                <Image 
                  src={logo} 
                  alt="Logo" 
                  width={32}
                  height={32}
                  unoptimized 
                  className="object-contain" 
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight leading-tight">
                {profile?.school_name || "Madrasah Mu'allimin"}
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Sistem Informasi Manajemen Ekstrakurikuler. Platform digital terpadu untuk pendataan, absensi, dan penilaian kegiatan santri.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                <span>{profile?.address || "Jl. Letjend S. Parman 68 Wirobrajan Yogyakarta"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-amber-500 shrink-0" />
                <span>{profile?.website || "www.muallimin.sch.id"}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Informasi Pendaftaran</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Informasi lengkap mengenai penerimaan peserta didik baru dapat dilihat pada portal resmi SPMB Mu&apos;allimin.
            </p>
            <a href="https://spmb.muallimin.sch.id" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                Portal SPMB Online
              </Button>
            </a>
          </div>
        </div>
        
        <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {profile?.school_name || "Madrasah Mu'allimin Muhammadiyah"}. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition-colors">Developer: Tim IT Mu&apos;allimin</span>
          </div>
        </div>
      </footer>
    </div>
  )
}