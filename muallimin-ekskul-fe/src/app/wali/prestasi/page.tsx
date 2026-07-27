import { cookies } from "next/headers"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Medal, Award, Calendar, BookOpen, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export interface AchievementData {
  id?: number;
  kategori?: string;
  nama_lomba: string;
  penyelenggara?: string | null;
  tingkat: string;
  peringkat: string;
  tanggal: string;
}

async function getPrestasiData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { error: "Sesi Anda telah berakhir, silakan login ulang." };

  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    };

    const dashboardRes = await fetch(`${apiUrl}/wali/dashboard`, { headers, cache: 'no-store' });
    
    if (!dashboardRes.ok) {
      return { error: "Gagal memuat API dari Server." };
    }

    const dashboardJson = await dashboardRes.json();
    const allAchievements = dashboardJson.data?.achievements || [];

    const tahfidz = allAchievements.filter((ach: AchievementData) => {
      const isKategoriTahfidz = ach.kategori?.toLowerCase() === 'tahfidz';
      const isNamaTahfidz = ach.nama_lomba?.toLowerCase().includes('tahfiz') || ach.nama_lomba?.toLowerCase().includes('tahfidz');
      return isKategoriTahfidz || isNamaTahfidz;
    });

    const prestasi_lomba = allAchievements.filter((ach: AchievementData) => {
      const isKategoriTahfidz = ach.kategori?.toLowerCase() === 'tahfidz';
      const isNamaTahfidz = ach.nama_lomba?.toLowerCase().includes('tahfiz') || ach.nama_lomba?.toLowerCase().includes('tahfidz');
      return !isKategoriTahfidz && !isNamaTahfidz;
    });

    return { tahfidz, prestasi_lomba };

  } catch (error) {
    return { error: "Koneksi ke Server terputus. Pastikan Backend berjalan." };
  }
}

export default async function WaliPrestasiPage() {
  const data = await getPrestasiData();
  const tahfidz = data?.tahfidz || [];
  const prestasiLomba = data?.prestasi_lomba || [];

  if (data?.error) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-red-500/5 backdrop-blur-xl text-red-900 p-8 rounded-[3rem] border-2 border-red-500/20 shadow-sm relative overflow-hidden">
          <p className="font-semibold text-red-800/90 leading-relaxed">{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-700 pb-16 pt-8 md:pt-10 px-4 md:px-0">
      
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden border-2 border-white/10">
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Data Prestasi & Hafalan
            </h1>
            <p className="text-indigo-100/80 mt-4 font-medium text-base md:text-lg leading-relaxed">
              Riwayat lengkap perlombaan, penghargaan, dan capaian hafalan (Tahfidz) putra/putri Anda.
            </p>
          </div>
          <div className="shrink-0">
             <Link href="/wali/dashboard">
               <Button className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 backdrop-blur-md rounded-2xl px-6 py-6 font-bold transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-base flex items-center gap-2">
                 <ArrowLeft className="w-5 h-5" /> Kembali
               </Button>
             </Link>
          </div>
        </div>
      </div>

      <Card className="rounded-[3rem] overflow-hidden bg-gradient-to-br from-rose-50/50 via-white/40 to-pink-50/50 backdrop-blur-3xl border-2 border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <CardHeader className="bg-transparent border-b-2 border-white/60 p-8 md:p-10">
          <CardTitle className="text-3xl font-black text-slate-800 flex items-center gap-5 tracking-tight">
            <div className="w-16 h-16 rounded-[1.5rem] bg-rose-100/50 border-2 border-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-8 h-8 text-rose-500" />
            </div>
            Capaian Hafalan (Tahfidz)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 md:p-10">
          {tahfidz.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {tahfidz.map((ach: AchievementData, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-6 p-8 rounded-[2.5rem] border-2 border-white bg-white/60 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                  <div className="w-20 h-20 rounded-[1.75rem] bg-rose-100/50 flex items-center justify-center shrink-0 border-2 border-white group-hover:bg-rose-500 transition-colors duration-500 shadow-sm">
                    <BookOpen className="w-10 h-10 text-rose-500 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-black text-slate-800 text-xl leading-tight mb-2 truncate group-hover:text-rose-600 transition-colors">{ach.nama_lomba}</h4>
                    <p className="text-sm text-slate-500 font-semibold mb-5 truncate">{ach.penyelenggara || "-"}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="bg-white text-slate-600 border-2 border-slate-100 shadow-sm text-xs font-bold px-4 py-1.5 rounded-xl">
                        {ach.tingkat}
                      </Badge>
                      <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-2 border-white shadow-sm text-xs font-bold px-4 py-1.5 rounded-xl">
                        Predikat: {ach.peringkat}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 ml-auto pt-2 sm:pt-0">
                        <Calendar className="w-4 h-4" /> {new Date(ach.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6 border-2 border-white shadow-sm">
                <BookOpen className="w-10 h-10 text-rose-200" />
              </div>
              <p className="text-slate-500 text-base font-medium">Belum ada riwayat capaian hafalan yang dicatatkan.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[3rem] overflow-hidden bg-blue-50/40 backdrop-blur-3xl border-2 border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <CardHeader className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/20 rounded-full translate-x-1/4 -translate-y-1/4 blur-3xl pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-blue-400/30 rounded-full -translate-x-1/4 translate-y-1/4 blur-2xl pointer-events-none"></div>
          <CardTitle className="text-3xl font-black flex items-center gap-5 relative z-10 tracking-tight">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center backdrop-blur-md border-2 border-white/40 shadow-sm">
              <Medal className="w-8 h-8 text-white" />
            </div>
            Riwayat Perlombaan & Kejuaraan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 md:p-10 bg-transparent">
          {prestasiLomba.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {prestasiLomba.map((ach: AchievementData, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-6 p-8 rounded-[2.5rem] border-2 border-white bg-white/60 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                  <div className="w-20 h-20 rounded-[1.75rem] bg-indigo-100/50 flex items-center justify-center shrink-0 border-2 border-white group-hover:bg-indigo-500 transition-colors duration-500 shadow-sm">
                    <Award className="w-10 h-10 text-indigo-500 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-black text-slate-800 text-xl leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors">{ach.nama_lomba}</h4>
                    <p className="text-sm text-slate-500 font-semibold mb-5 truncate">{ach.penyelenggara || "-"}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="bg-white text-slate-600 border-2 border-slate-100 shadow-sm text-xs font-bold px-4 py-1.5 rounded-xl">
                        {ach.tingkat}
                      </Badge>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-2 border-white shadow-sm text-xs font-bold px-4 py-1.5 rounded-xl">
                        Juara {ach.peringkat}
                      </Badge>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 ml-auto pt-2 sm:pt-0">
                        <Calendar className="w-4 h-4" /> {new Date(ach.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6 border-2 border-white shadow-sm">
                <Award className="w-10 h-10 text-indigo-200" />
              </div>
              <p className="text-slate-500 text-base font-medium">Belum ada riwayat perlombaan yang dicatatkan.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}