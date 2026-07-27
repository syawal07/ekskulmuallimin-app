'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Activity, GraduationCap, Medal, Calendar, Award, CheckCircle2, TrendingUp, Sparkles } from "lucide-react"

export interface ProfileData {
  name?: string;
  nis?: string;
  class?: string;
  tahun_pelajaran?: string;
  semester?: string;
}

export interface AttendanceSummary {
  hadir?: number;
  total_meetings?: number;
  percentage?: number;
}

export interface AssessmentData {
  score?: number | string;
  predicate?: string;
  description?: string;
}

export interface ExculData {
  name: string;
  attendance_summary?: AttendanceSummary;
  assessment?: AssessmentData;
}

export interface PerkaderanData {
  jenjang: string;
  jabatan?: string;
  status: string;
  attendance_summary?: AttendanceSummary;
  assessment?: AssessmentData;
}

export interface AchievementData {
  nama_lomba: string;
  penyelenggara?: string;
  tingkat: string;
  peringkat: string;
  tanggal: string;
}

export interface DashboardData {
  profile?: ProfileData;
  exculs?: ExculData[];
  perkaderans?: PerkaderanData[];
  achievements?: AchievementData[];
}

export default function WaliDashboardClient({ data }: { data: DashboardData }) {
  const profile = data?.profile || {}
  const exculs = data?.exculs || []
  const perkaderans = data?.perkaderans || []
  const achievements = data?.achievements || []

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      <div className="bg-gradient-to-br from-indigo-400 via-rose-300 to-amber-200 rounded-[3rem] p-8 md:p-12 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden border-2 border-white/40">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="w-28 h-28 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center border-2 border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_40px_rgb(0,0,0,0.08)] shrink-0">
              <User className="w-12 h-12 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-bold tracking-[0.2em] text-[12px] mb-2 uppercase">Profil Siswa</p>
              <h1 className="text-4xl md:text-5xl font-black mb-5 tracking-tighter truncate drop-shadow-sm">{profile.name || "Nama Siswa"}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2 bg-white/30 backdrop-blur-xl px-5 py-2.5 rounded-2xl font-bold border-2 border-white/50 text-slate-800 shadow-sm">
                  NIS: {profile.nis || "-"}
                </span>
                <span className="flex items-center gap-2 bg-slate-900/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl font-bold border-2 border-white/30 text-slate-900 shadow-sm">
                  Kelas {profile.class || "-"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/30 backdrop-blur-3xl border-2 border-white/60 px-10 py-8 rounded-[2.5rem] text-center min-w-[220px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_40px_rgb(0,0,0,0.08)] w-full md:w-auto">
            <p className="text-[12px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-3">Tahun Ajaran</p>
            <p className="font-black text-3xl tracking-tighter text-slate-900">{profile.tahun_pelajaran || "Aktif"}</p>
            <p className="text-xs font-black text-white mt-4 bg-slate-900 inline-block px-5 py-2 rounded-xl shadow-md uppercase tracking-wider">Semester {profile.semester || "Ganjil"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        <Card className="rounded-[3rem] overflow-hidden bg-blue-50/40 backdrop-blur-3xl border-2 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_12px_40px_rgba(59,130,246,0.08)]">
          <CardHeader className="bg-transparent border-b-2 border-white/50 p-8">
            <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
              <div className="w-14 h-14 rounded-[1.25rem] bg-blue-500/10 border-2 border-white/80 flex items-center justify-center shadow-sm">
                <Activity className="w-7 h-7 text-blue-600" />
              </div>
              Laporan Ekstrakurikuler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-transparent">
            {exculs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {exculs.map((ex: ExculData, idx: number) => (
                  <div key={idx} className="p-8 bg-white/40 hover:bg-white/80 transition-all duration-300 rounded-[2.5rem] group border-2 border-white/60 shadow-sm hover:shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <h4 className="font-black text-slate-800 text-2xl group-hover:text-blue-600 transition-colors tracking-tight">{ex.name}</h4>
                      {ex.assessment?.score ? (
                        <div className="flex flex-col sm:items-end">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 hidden sm:block">Nilai Akhir</span>
                          <div className="bg-white backdrop-blur-xl text-blue-700 font-black px-6 py-3 rounded-2xl border-2 border-white shadow-sm flex items-center gap-3">
                            <span className="text-xl">{ex.assessment.score}</span>
                            <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                            <span className="text-base">{ex.assessment.predicate}</span>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-2 border-white bg-white/50 backdrop-blur-md font-bold px-5 py-2.5 rounded-xl shadow-sm text-sm">Belum dinilai</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border-2 border-white shadow-sm">
                      <div className="flex-1 text-center">
                        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kehadiran
                        </p>
                        <p className="font-black text-slate-800 text-4xl tracking-tighter">
                          {ex.attendance_summary?.hadir || 0}
                          <span className="text-lg font-bold text-slate-400 ml-1">/ {ex.attendance_summary?.total_meetings || 0}</span>
                        </p>
                      </div>
                      <div className="w-[2px] h-20 bg-blue-100 mx-6"></div>
                      <div className="flex-1 text-center">
                        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" /> Persentase
                        </p>
                        <p className="font-black text-blue-600 text-4xl tracking-tighter">
                          {ex.attendance_summary?.percentage || 0}%
                        </p>
                      </div>
                    </div>
                    {ex.assessment?.description && (
                      <div className="mt-6 bg-blue-50/80 backdrop-blur-md p-6 rounded-[2rem] border-2 border-white relative shadow-sm">
                        <Sparkles className="w-6 h-6 text-blue-400 absolute top-6 right-6 opacity-50" />
                        <p className="text-base text-slate-700 leading-relaxed font-semibold pr-10">
                          &quot;{ex.assessment.description}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6 border-2 border-white shadow-sm">
                  <Activity className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-black text-xl mb-2 tracking-tight">Belum Ada Data</h4>
                <p className="text-slate-500 text-base font-medium">Siswa tidak tercatat mengikuti ekstrakurikuler semester ini.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-10">
          
          <Card className="rounded-[3rem] overflow-hidden bg-amber-50/40 backdrop-blur-3xl border-2 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_12px_40px_rgba(245,158,11,0.06)]">
            <CardHeader className="bg-transparent border-b-2 border-white/50 p-8">
              <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                <div className="w-14 h-14 rounded-[1.25rem] bg-amber-500/10 border-2 border-white/80 flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-7 h-7 text-amber-600" />
                </div>
                Perkaderan (TKM)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-transparent">
              {perkaderans.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {perkaderans.map((pk: PerkaderanData, idx: number) => (
                    <div key={idx} className="p-8 bg-white/40 hover:bg-white/80 transition-all duration-300 rounded-[2.5rem] border-2 border-white/60 shadow-sm hover:shadow-md group">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                          <h4 className="font-black text-slate-800 text-2xl mb-3 group-hover:text-amber-600 transition-colors tracking-tight">{pk.jenjang}</h4>
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold bg-white border-2 border-white shadow-sm text-slate-700 backdrop-blur-md">
                            <User className="w-4 h-4" /> {pk.jabatan || 'Peserta'}
                          </span>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-2 border-white shadow-sm font-black px-5 py-2.5 rounded-xl text-sm">
                          {pk.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-white/60 backdrop-blur-md border-2 border-white p-6 rounded-[2rem] flex-1 flex flex-col justify-center shadow-sm">
                          <span className="text-slate-500 text-[11px] uppercase tracking-[0.2em] font-bold mb-2">Kehadiran</span>
                          <span className="font-black text-slate-800 text-4xl tracking-tighter">{pk.attendance_summary?.percentage || 0}%</span>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-md border-2 border-white p-6 rounded-[2rem] flex-1 flex flex-col justify-center relative overflow-hidden shadow-sm">
                          <span className="text-slate-500 text-[11px] uppercase tracking-[0.2em] font-bold mb-2">Nilai Akhir</span>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-amber-600 text-4xl tracking-tighter">{pk.assessment?.score || '-'}</span>
                            {pk.assessment?.predicate && (
                              <span className="font-black text-amber-700/60 text-xl">{pk.assessment.predicate}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {pk.assessment?.description && (
                        <div className="mt-6 bg-amber-50/80 backdrop-blur-md p-6 rounded-[2rem] border-2 border-white relative shadow-sm">
                          <Sparkles className="w-6 h-6 text-amber-400 absolute top-6 right-6 opacity-50" />
                          <p className="text-base text-slate-700 leading-relaxed font-semibold pr-10">
                            &quot;{pk.assessment.description}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6 border-2 border-white shadow-sm">
                    <GraduationCap className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-base font-medium">Belum ada catatan kepesertaan perkaderan.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[3rem] overflow-hidden bg-emerald-50/40 backdrop-blur-3xl border-2 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_12px_40px_rgba(16,185,129,0.06)]">
            <CardHeader className="bg-gradient-to-r from-emerald-400 to-teal-500 p-8 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/20 rounded-full translate-x-1/4 -translate-y-1/4 blur-3xl pointer-events-none"></div>
              <CardTitle className="text-2xl font-black flex items-center gap-4 relative z-10 tracking-tight">
                <div className="w-14 h-14 rounded-[1.25rem] bg-white/20 flex items-center justify-center backdrop-blur-md border-2 border-white/40 shadow-sm">
                  <Medal className="w-7 h-7 text-white" />
                </div>
                Riwayat Prestasi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-transparent">
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.slice(0, 3).map((ach: AchievementData, idx: number) => (
                    <div key={idx} className="flex gap-6 p-6 rounded-[2rem] border-2 border-white bg-white/60 backdrop-blur-xl hover:bg-white hover:shadow-md transition-all duration-300 group">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center shrink-0 border-2 border-white group-hover:bg-emerald-500 transition-colors shadow-sm">
                        <Award className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 text-lg leading-tight mb-2 truncate group-hover:text-emerald-700 transition-colors tracking-tight">{ach.nama_lomba}</h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="secondary" className="bg-white text-slate-700 border-2 border-white shadow-sm text-[11px] font-bold px-3 py-1 rounded-xl backdrop-blur-md">
                            {ach.tingkat}
                          </Badge>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-2 border-white shadow-sm text-[11px] font-bold px-3 py-1 rounded-xl backdrop-blur-md">
                            Juara {ach.peringkat}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6 border-2 border-white shadow-sm">
                    <Medal className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-base font-medium">Belum ada riwayat prestasi yang dicatatkan.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}