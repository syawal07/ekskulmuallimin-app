import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import LoginForm from "./login-form" 

export const dynamic = "force-dynamic"

interface CompanyProfileData {
  logo_url: string | null;
  login_image_url: string | null;
  login_quote: string | null;
  login_quote_author: string | null;
}

async function getProfileData(): Promise<CompanyProfileData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    if (!apiUrl) return null;
    
    const res = await fetch(`${apiUrl}/landing`, { cache: 'no-store' });
    if (!res.ok) return null;
    
    const result = await res.json();
    return result.data?.profile as CompanyProfileData | null;
  } catch (err) {
    console.error(err);
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

export default async function LoginPage() {
  const profile = await getProfileData();
  
  const logoUrlFromDb = profile?.logo_url ? getImageUrl(profile.logo_url) : "/logo.png";
  const bgImageUrlFromDb = profile?.login_image_url ? getImageUrl(profile.login_image_url) : "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1986&auto=format&fit=crop";

  const logo = logoUrlFromDb;
  const bgImage = bgImageUrlFromDb;
  const quote = profile?.login_quote || "Pendidikan adalah tiket ke masa depan.";
  const author = profile?.login_quote_author || "Madrasah Mu'allimin";

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-[#F8FAFC]">
      
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 lg:text-white lg:hover:text-white/80 lg:hover:bg-white/10 rounded-full font-semibold px-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Beranda
          </Button>
        </Link>
      </div>

      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden h-full">
        
        <Image 
          src={bgImage} 
          alt="Login Background" 
          fill 
          unoptimized
          className="object-cover"
          priority
        />
        
        {/* Layer Gelap diubah ke Biru Navy */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-slate-900/60 to-slate-900/30 z-10" />
        
        <div className="relative z-20 flex items-center gap-4 font-bold text-lg">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg">
            <Image 
              src={logo} 
              alt="Logo" 
              width={40} 
              height={40} 
              unoptimized
              className="object-contain" 
            />
          </div>
          <span className="tracking-wide text-white/95 uppercase text-xl">Muallimin System</span>
        </div>

        <div className="relative z-20 mt-auto max-w-lg">
          <blockquote className="space-y-6">
            <p className="text-3xl font-black leading-tight text-white tracking-tight">
              &ldquo;{quote}&rdquo;
            </p>
            <footer className="text-sm font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-6 h-0.5 bg-amber-400" /> {author}
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-white p-3 rounded-[1.5rem] shadow-xl shadow-blue-900/5 mb-2 flex items-center justify-center border border-slate-100">
               <Image 
                  src={logo} 
                  alt="Logo" 
                  width={60} 
                  height={60} 
                  unoptimized
                  className="object-contain" 
                />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">Selamat Datang</h1>
              <p className="text-sm font-medium text-slate-500">
                Masuk untuk mengakses portal sistem
              </p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
             <LoginForm /> 
          </div>

          <p className="text-center text-xs font-semibold text-slate-400 px-8 uppercase tracking-widest">
             &copy; {new Date().getFullYear()} Mu&apos;allimin Yogyakarta
          </p>
          
        </div>
      </div>
    </div>
  )
}