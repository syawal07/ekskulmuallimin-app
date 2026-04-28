import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Users, Globe, MapPin, CheckCircle2, Sparkles, Camera, BookOpen, ChevronRight } from "lucide-react"

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
      
      {/* HEADER: Disamakan dengan web SPMB (Full width, transparan/biru) */}
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
              <Link href="#news" className="hover:text-amber-400 transition-colors">Informasi</Link>
              <Link href="#stats" className="hover:text-amber-400 transition-colors">Pendaftaran</Link>
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
        
        {/* HERO SECTION: Biru Solid seperti web SPMB */}
        <section className="relative w-full min-h-screen flex items-center pt-32 pb-32 md:pb-48 bg-blue-700 overflow-hidden">
          {/* Aksen garis halus di background */}
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
                    Daftar Sekarang <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#about">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base rounded-xl text-white bg-transparent border border-white/30 hover:bg-white/10 font-bold transition-all duration-300">
                    Pendaftaran Inden
                  </Button>
                </Link>
              </div>
            </div>

            {/* GAMBAR HERO: Lebih elegan dan clean dengan aksen siku kuning */}
            <div className="relative mx-auto lg:ml-auto w-full max-w-[500px] lg:max-w-[550px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              {/* Aksen Siku Kanan Atas */}
              <div className="absolute -top-6 -right-6 w-24 h-24 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl hidden md:block" />
              {/* Aksen Siku Kiri Bawah */}
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

              {/* Floating Badge ala SPMB */}
              <div className="absolute -bottom-8 right-4 md:-bottom-10 md:right-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="bg-amber-400 p-3 rounded-xl text-slate-900">
                  <Users className="w-6 h-6" />
                </div>
                <div className="pr-4">
                  <p className="text-xl font-black text-slate-900 tracking-tight leading-none">100.000+</p>
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
                { title: "Kader Juara", desc: "Pembinaan intensif terstruktur untuk mencetak pemimpin di berbagai kompetisi.", icon: Trophy }
              ].map((item, i) => (
                <div key={i} className="group bg-white p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-2 transition-all duration-500 text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="w-full py-24 md:py-32 bg-white border-y border-slate-100">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-3">
                <span className="text-amber-500 font-bold tracking-[0.2em] text-sm uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4"/> Informasi Terkini
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Berita & Update</h2>
              </div>
              <Link href="/public/news">
                <Button variant="ghost" className="hidden md:flex font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-6">
                  Lihat Semua Berita <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item) => (
                  <Link href={`/berita/${item.slug}`} key={item.id} className="group flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
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
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <Globe className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
                        {item.title}
                      </h3>
                      <div className="mt-auto flex items-center text-amber-500 font-bold text-sm transition-colors duration-300">
                        Selengkapnya <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <p className="text-slate-500 font-medium">Belum ada berita yang dipublikasikan.</p>
              </div>
            )}
          </div>
        </section>

        <section id="gallery" className="w-full py-24 md:py-32 bg-slate-900">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16">
            <div className="flex flex-col items-center text-center mb-16 space-y-3">
              <span className="text-amber-400 font-bold tracking-[0.2em] text-sm uppercase">Dokumentasi</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Galeri Kegiatan</h2>
            </div>

            {galleries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gal) => (
                  <div key={gal.id} className="group relative aspect-square md:aspect-[4/5] overflow-hidden rounded-3xl bg-slate-800">
                    <Image 
                      src={getImageUrl(gal.image_url)} 
                      alt={gal.title} 
                      fill 
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90 transition-opacity duration-500 flex items-end p-6">
                      <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500 w-full">
                        <h4 className="text-white font-bold text-lg leading-snug tracking-tight border-l-4 border-amber-400 pl-3">{gal.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-700 rounded-3xl bg-slate-800/30">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium">Belum ada dokumentasi kegiatan.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="w-full bg-blue-900 py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-16">
          <div className="grid md:grid-cols-3 gap-12 mb-12 border-b border-blue-800 pb-12">
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white">
                <div className="bg-white rounded-full p-1.5 flex items-center justify-center">
                  <Image 
                    src={logo} 
                    alt="Logo" 
                    width={36}
                    height={36}
                    unoptimized 
                    className="object-contain" 
                  />
                </div>
                <span className="font-bold text-xl tracking-tight">Muallimin System</span>
              </div>
              <p className="leading-relaxed max-w-sm text-sm font-medium text-blue-100">
                Mencetak Kader Ulama, Intelek, dan Pendidik Bangsa yang Berkemajuan.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-base tracking-tight uppercase">Hubungi Kami</h4>
              <ul className="space-y-4 text-sm font-medium text-blue-100">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="leading-relaxed">{profile?.address || "Alamat sekolah belum diatur."}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{profile?.email || "-"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{profile?.phone || "-"}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-base tracking-tight uppercase">Akses Cepat</h4>
              <ul className="space-y-3 text-sm font-medium text-blue-100">
                {profile?.website && (
                  <li>
                    <Link href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" className="hover:text-amber-400 transition-colors">
                      Website Resmi
                    </Link>
                  </li>
                )}
                <li><Link href="/login" className="hover:text-amber-400 transition-colors">Portal Admin & Mentor</Link></li>
                <li><Link href="#" className="hover:text-amber-400 transition-colors">Jadwal Ekskul</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-blue-200">
            <p>&copy; {new Date().getFullYear()} Tim IT Madrasah Mu&apos;allimin Muhammadiyah.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}