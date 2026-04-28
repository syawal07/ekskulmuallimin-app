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

  const heroTitle = profile?.hero_title || "Wadah Kreativitas"
  const heroSubtitle = profile?.hero_subtitle || "Kader Pemimpin"
  const heroDesc = profile?.hero_description || "Platform manajemen ekstrakurikuler sekolah untuk memantau bakat siswa."
  const logo = profile?.logo_url ? getImageUrl(profile.logo_url) : "/logo.png"

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      
      <header className="fixed top-6 z-50 w-full px-4 sm:px-6 md:px-12 flex justify-center transition-all duration-500">
        <div className="w-full max-w-6xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm p-1 transition-transform duration-300 group-hover:scale-105 border border-white">
              <Image 
                src={logo} 
                alt="Logo" 
                fill
                unoptimized 
                className="object-contain p-1" 
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xl font-black text-slate-800 leading-none uppercase tracking-tight">
                {profile?.school_name || "MUALLIMIN"} 
              </span>
              <span className="text-[10px] text-amber-500 font-bold tracking-[0.25em] mt-1 uppercase">Sistem Ekskul</span>
            </div>
          </div>

          <nav className="flex items-center gap-6 md:gap-10">
            <div className="hidden md:flex gap-8 text-sm font-bold text-slate-500">
              <Link href="#about" className="hover:text-blue-600 transition-colors">Tentang</Link>
              <Link href="#stats" className="hover:text-blue-600 transition-colors">Statistik</Link>
              <Link href="#gallery" className="hover:text-blue-600 transition-colors">Galeri</Link>
            </div>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 md:px-8 md:py-6 font-bold transition-all duration-300 shadow-[0_8px_30px_rgba(37,99,235,0.25)] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(37,99,235,0.35)]">
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        
        <section className="relative w-full min-h-screen flex items-center pt-32 pb-32 overflow-hidden bg-slate-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-amber-50/30" />
          
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24 grid lg:grid-cols-12 gap-16 items-center relative z-10 mt-10 lg:mt-0">
            <div className="lg:col-span-7 space-y-10 pl-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-white/60 px-5 py-2.5 text-sm font-bold text-blue-700 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Platform Digital Terpadu
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-[5.5rem] font-black text-slate-900 leading-[1.05] tracking-tight">
                {heroTitle} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block mt-2">
                  {heroSubtitle}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
                {heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                    Mulai Jelajahi
                  </Button>
                </Link>
                <Link href="#about">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-8 text-lg rounded-full text-slate-700 bg-white/50 border-2 border-slate-200/50 hover:border-blue-200 hover:bg-blue-50 font-bold transition-all duration-300 backdrop-blur-sm">
                    Pelajari Fitur
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative mx-auto w-full max-w-[500px] animate-in fade-in slide-in-from-right-12 duration-1000 delay-200 fill-mode-both">
              <div className="relative aspect-[4/5] rounded-[3rem] bg-gradient-to-br from-blue-100 to-white shadow-[0_30px_60px_-15px_rgba(37,99,235,0.15)] border-[8px] border-white/60 backdrop-blur-xl rotate-3 hover:rotate-0 transition-transform duration-700 overflow-hidden group">
                {profile?.hero_image_url ? (
                  <Image 
                    src={getImageUrl(profile.hero_image_url)} 
                    alt="Hero" 
                    fill
                    unoptimized 
                    className="object-cover w-full h-full scale-105 group-hover:scale-110 transition-transform duration-1000" 
                    priority 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/50">
                    <Image 
                      src={logo} 
                      alt="Hero Fallback" 
                      width={220} 
                      height={220} 
                      unoptimized 
                      className="object-contain drop-shadow-xl opacity-50 grayscale" 
                    />
                  </div>
                )}
                
                <div className="absolute bottom-8 -left-10 bg-white/95 backdrop-blur-xl p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white flex items-center gap-5 -rotate-6 hover:rotate-0 transition-all duration-500 cursor-default">
                  <div className="bg-amber-400 p-4 rounded-2xl text-slate-900 shadow-inner">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="pr-4">
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Status Sistem</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">Online 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="relative w-full -mt-20 z-20 px-4">
          <div className="container max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.05)] border border-white p-10 relative overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center relative z-10 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                <div className="group flex flex-col items-center justify-center pt-4 md:pt-0">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500 mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                    {studentEnrollmentCount > 0 ? studentEnrollmentCount + "+" : "-"}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Partisipan</p>
                </div>

                <div className="group flex flex-col items-center justify-center pt-8 md:pt-0">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500 mb-4">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                    {exculCount > 0 ? exculCount : "0"}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Ekskul Aktif</p>
                </div>

                <div className="group flex flex-col items-center justify-center pt-8 md:pt-0">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500 mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">2</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Kampus</p>
                </div>

                <div className="group flex flex-col items-center justify-center pt-8 md:pt-0">
                  <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform duration-500 mb-4">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">1</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Portal Terpadu</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-28 md:py-40 bg-slate-50 relative">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
            <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
              <span className="inline-block bg-blue-100 text-blue-700 font-extrabold tracking-[0.2em] text-xs uppercase px-4 py-2 rounded-full">Tentang Platform</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">Ekosistem Pendidikan Berkemajuan</h2>
              <p className="text-slate-500 text-lg leading-relaxed whitespace-pre-line font-medium max-w-2xl mx-auto">
                {profile?.about_text || "Deskripsi program belum diatur oleh admin."}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                { title: "Kampus Induk", desc: "Pusat pengembangan akademik dan keagamaan di kawasan Wirobrajan.", icon: BookOpen },
                { title: "Kampus Terpadu", desc: "Fasilitas modern di Sedayu dengan lingkungan asri pendukung sains & teknologi.", icon: Globe },
                { title: "Kader Juara", desc: "Pembinaan intensif terstruktur untuk mencetak pemimpin di berbagai kompetisi.", icon: Trophy }
              ].map((item, i) => (
                <div key={i} className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] hover:-translate-y-2 transition-all duration-500 text-center">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="w-full py-28 md:py-32 bg-white">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-4">
                <span className="text-blue-600 font-extrabold tracking-[0.2em] text-sm uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4"/> Informasi Terkini
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Berita & Update</h2>
              </div>
              <Link href="/public/news">
                <Button variant="ghost" className="hidden md:flex font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full px-6">
                  Lihat Semua Publikasi <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item) => (
                  <Link href={`/berita/${item.slug}`} key={item.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden p-3 pb-0">
                      <div className="relative w-full h-full rounded-t-[2rem] overflow-hidden">
                        {item.image ? (
                          <Image 
                            src={getImageUrl(item.image)} 
                            alt={item.title} 
                            fill 
                            unoptimized
                            className="object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            <Globe className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-extrabold text-slate-900 shadow-sm uppercase tracking-wider">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-xl font-black text-slate-900 mb-6 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
                        {item.title}
                      </h3>
                      <div className="mt-auto flex items-center text-slate-400 font-bold text-sm group-hover:text-amber-500 transition-colors duration-300">
                        Baca selengkapnya <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-dashed border-slate-200 rounded-[3rem] bg-slate-50">
                <p className="text-slate-500 font-medium text-lg">Belum ada berita yang dipublikasikan.</p>
              </div>
            )}
          </div>
        </section>

        <section id="gallery" className="w-full py-28 md:py-36 bg-slate-900 rounded-t-[3rem] md:rounded-t-[5rem]">
          <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
            <div className="flex flex-col items-center text-center mb-20 space-y-4">
              <span className="text-amber-400 font-extrabold tracking-[0.2em] text-sm uppercase">Dokumentasi Lensa</span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Galeri Kegiatan</h2>
            </div>

            {galleries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gal) => (
                  <div key={gal.id} className="group relative aspect-square md:aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-800">
                    <Image 
                      src={getImageUrl(gal.image_url)} 
                      alt={gal.title} 
                      fill 
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
                        <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-extrabold rounded-full mb-4 uppercase tracking-widest shadow-lg">Sorotan</span>
                        <h4 className="text-white font-black text-xl leading-snug tracking-tight border-l-2 border-amber-500 pl-3">{gal.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-700 rounded-[3rem] bg-slate-800/30">
                <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6">
                    <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium text-lg">Belum ada dokumentasi kegiatan.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="w-full bg-slate-950 text-slate-400 py-16 border-t border-white/5 -mt-8">
        <div className="container max-w-7xl mx-auto px-6 md:px-12 xl:px-24">
          <div className="grid md:grid-cols-3 gap-16 mb-16 border-b border-white/10 pb-16">
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white">
                <div className="relative w-12 h-12 bg-white/5 rounded-xl p-2 border border-white/10 backdrop-blur-sm">
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
              <p className="leading-relaxed max-w-sm text-sm font-medium">
                <strong className="text-slate-200">{profile?.school_name || "Madrasah Mu'allimin"}</strong> <br/>
                Mencetak Kader Ulama, Intelek, dan Pendidik Bangsa yang Berkemajuan.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-6 text-lg tracking-tight uppercase">Hubungi Kami</h4>
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
              <h4 className="text-white font-black mb-6 text-lg tracking-tight uppercase">Akses Cepat</h4>
              <ul className="space-y-4 text-sm font-bold">
                {profile?.website && (
                  <li>
                    <Link href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" className="flex items-center gap-3 text-slate-400 hover:text-amber-400 transition-colors">
                      <Globe className="w-4 h-4" /> Website Resmi
                    </Link>
                  </li>
                )}
                <li><Link href="/login" className="flex items-center gap-3 text-slate-400 hover:text-amber-400 transition-colors"><ArrowRight className="w-4 h-4"/> Portal Admin</Link></li>
                <li><Link href="#" className="flex items-center gap-3 text-slate-400 hover:text-amber-400 transition-colors"><ArrowRight className="w-4 h-4"/> Jadwal Ekskul</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold tracking-wide uppercase text-slate-500">
            <p>&copy; {new Date().getFullYear()} Tim IT Muallimin. All rights reserved.</p>
            <p className="flex items-center gap-1.5">Dibuat dengan <span className="text-red-500 text-sm">❤️</span> untuk pendidikan.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}