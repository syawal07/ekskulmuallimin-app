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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* KARTU PROFIL UTAMA */}
      <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/30 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center border border-t-white/60 border-l-white/60 border-b-white/10 border-r-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_30px_rgb(0,0,0,0.12)] shrink-0">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-indigo-100 font-bold tracking-widest text-[11px] mb-1.5 uppercase">Profil Siswa</p>
              <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight truncate">{profile.name || "Nama Siswa"}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl font-semibold border border-t-white/20 border-l-white/20 border-b-transparent border-r-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  NIS: {profile.nis || "-"}
                </span>
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl font-semibold border border-t-white/40 border-l-white/40 border-b-transparent border-r-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_15px_rgb(0,0,0,0.05)]">
                  Kelas {profile.class || "-"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-2xl border border-t-white/30 border-l-white/30 border-b-white/5 border-r-white/5 px-8 py-6 rounded-[2rem] text-center min-w-[200px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_30px_rgb(0,0,0,0.1)] w-full md:w-auto">
            <p className="text-[11px] font-bold text-indigo-100 uppercase tracking-widest mb-2">Tahun Ajaran</p>
            <p className="font-black text-2xl tracking-tight">{profile.tahun_pelajaran || "Aktif"}</p>
            <p className="text-xs font-bold text-white mt-3 bg-black/20 inline-block px-4 py-1.5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-t-white/10 border-l-white/10 border-b-transparent border-r-transparent">Semester {profile.semester || "Ganjil"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* KARTU EKSTRAKURIKULER (TINTED BLUE) */}
        <Card className="rounded-[2.5rem] overflow-hidden bg-blue-50/30 backdrop-blur-2xl border border-t-white/90 border-l-white/90 border-b-blue-200/40 border-r-blue-200/40 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_12px_40px_rgba(59,130,246,0.08)]">
          <CardHeader className="bg-transparent border-b border-blue-100/40 p-8">
            <CardTitle className="text-2xl font-extrabold text-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1.25rem] bg-blue-500/10 border border-t-white border-l-white border-b-blue-200/50 border-r-blue-200/50 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              Laporan Ekstrakurikuler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 bg-transparent">
            {exculs.length > 0 ? (
              <div className="flex flex-col gap-2">
                {exculs.map((ex: ExculData, idx: number) => (
                  <div key={idx} className="p-6 bg-white/30 hover:bg-white/70 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_8px_30px_rgba(59,130,246,0.12)] transition-all duration-300 rounded-[2rem] group border border-t-white/50 border-l-white/50 border-b-blue-100/30 border-r-blue-100/30 hover:border-white/90">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h4 className="font-extrabold text-slate-800 text-xl group-hover:text-blue-600 transition-colors">{ex.name}</h4>
                      {ex.assessment?.score ? (
                        <div className="flex flex-col sm:items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 hidden sm:block">Nilai Akhir</span>
                          <div className="bg-white/80 backdrop-blur-xl text-blue-700 font-black px-5 py-2.5 rounded-2xl border border-t-white border-l-white border-b-blue-100/50 border-r-blue-100/50 shadow-[0_4px_20px_rgba(59,130,246,0.08)] flex items-center gap-2">
                            <span className="text-lg">{ex.assessment.score}</span> 
                            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span> 
                            <span className="text-sm">{ex.assessment.predicate}</span>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border border-t-white border-l-white border-b-blue-100/50 border-r-blue-100/50 bg-white/40 backdrop-blur-md font-semibold px-4 py-2 rounded-xl shadow-sm">Belum dinilai</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center bg-white/50 backdrop-blur-md rounded-[1.5rem] p-5 border border-t-white border-l-white border-b-blue-100/50 border-r-blue-100/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                      <div className="flex-1 text-center">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kehadiran
                        </p>
                        <p className="font-black text-slate-800 text-3xl tracking-tight">
                          {ex.attendance_summary?.hadir || 0}
                          <span className="text-base font-bold text-slate-400 ml-1">/ {ex.attendance_summary?.total_meetings || 0}</span>
                        </p>
                      </div>
                      <div className="w-px h-16 bg-blue-200/50 mx-4"></div>
                      <div className="flex-1 text-center">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-blue-500" /> Persentase
                        </p>
                        <p className="font-black text-blue-600 text-3xl tracking-tight">
                          {ex.attendance_summary?.percentage || 0}%
                        </p>
                      </div>
                    </div>

                    {ex.assessment?.description && (
                      <div className="mt-5 bg-blue-50/60 backdrop-blur-md p-5 rounded-[1.5rem] border border-t-white/80 border-l-white/80 border-b-blue-200/40 border-r-blue-200/40 relative shadow-[inset_0_2px_10px_rgba(59,130,246,0.05)]">
                        <Sparkles className="w-5 h-5 text-blue-400 absolute top-5 right-5 opacity-50" />
                        <p className="text-sm text-slate-700 leading-relaxed font-medium pr-8">
                          &quot;{ex.assessment.description}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-t-white border-l-white border-b-blue-100/50 border-r-blue-100/50 shadow-[0_8px_30px_rgba(59,130,246,0.06)]">
                  <Activity className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-extrabold text-lg mb-2">Belum Ada Data</h4>
                <p className="text-slate-500 text-sm font-medium">Siswa tidak tercatat mengikuti ekstrakurikuler semester ini.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          
          {/* KARTU PERKADERAN (TINTED AMBER) */}
          <Card className="rounded-[2.5rem] overflow-hidden bg-amber-50/20 backdrop-blur-2xl border border-t-white/90 border-l-white/90 border-b-amber-200/40 border-r-amber-200/40 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_12px_40px_rgba(245,158,11,0.06)]">
            <CardHeader className="bg-transparent border-b border-amber-100/40 p-8">
              <CardTitle className="text-2xl font-extrabold text-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-amber-500/10 border border-t-white border-l-white border-b-amber-200/50 border-r-amber-200/50 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <GraduationCap className="w-6 h-6 text-amber-600" />
                </div>
                Perkaderan (TKM)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 bg-transparent">
              {perkaderans.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {perkaderans.map((pk: PerkaderanData, idx: number) => (
                    <div key={idx} className="p-6 bg-white/30 hover:bg-white/70 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_8px_30px_rgba(245,158,11,0.1)] transition-all duration-300 rounded-[2rem] border border-t-white/50 border-l-white/50 border-b-amber-100/30 border-r-amber-100/30 hover:border-white/90 group">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xl mb-2 group-hover:text-amber-600 transition-colors">{pk.jenjang}</h4>
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold bg-white/80 border border-t-white border-l-white border-b-amber-100/30 border-r-amber-100/30 shadow-sm text-slate-600 backdrop-blur-md">
                            <User className="w-3.5 h-3.5" /> {pk.jabatan || 'Peserta'}
                          </span>
                        </div>
                        <Badge className="bg-amber-100/90 backdrop-blur-md text-amber-700 border border-t-white border-l-white border-b-amber-200/50 border-r-amber-200/50 shadow-sm font-bold px-4 py-2 rounded-xl text-sm">
                          {pk.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-white/50 backdrop-blur-md border border-t-white border-l-white border-b-amber-100/50 border-r-amber-100/50 p-5 rounded-[1.5rem] flex-1 flex flex-col justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                          <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1.5">Kehadiran</span>
                          <span className="font-black text-slate-800 text-3xl tracking-tight">{pk.attendance_summary?.percentage || 0}%</span>
                        </div>
                        
                        <div className="bg-white/50 backdrop-blur-md border border-t-white border-l-white border-b-amber-100/50 border-r-amber-100/50 p-5 rounded-[1.5rem] flex-1 flex flex-col justify-center relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                          <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1.5">Nilai Akhir</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-amber-600 text-3xl tracking-tight">{pk.assessment?.score || '-'}</span>
                            {pk.assessment?.predicate && (
                              <span className="font-bold text-amber-700/60 text-lg">{pk.assessment.predicate}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {pk.assessment?.description && (
                        <div className="mt-5 bg-amber-50/60 backdrop-blur-md p-5 rounded-[1.5rem] border border-t-white/80 border-l-white/80 border-b-amber-200/40 border-r-amber-200/40 relative shadow-[inset_0_2px_10px_rgba(245,158,11,0.05)]">
                          <Sparkles className="w-5 h-5 text-amber-400 absolute top-5 right-5 opacity-50" />
                          <p className="text-sm text-slate-700 leading-relaxed font-medium pr-8">
                            &quot;{pk.assessment.description}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-white/60 backdrop-blur-md rounded-3xl flex items-center justify-center mb-5 border border-t-white border-l-white border-b-amber-100/50 border-r-amber-100/50 shadow-[0_8px_30px_rgba(245,158,11,0.06)]">
                    <GraduationCap className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Belum ada catatan kepesertaan perkaderan.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* KARTU PRESTASI (TINTED EMERALD) */}
          <Card className="rounded-[2.5rem] overflow-hidden bg-emerald-50/20 backdrop-blur-2xl border border-t-white/90 border-l-white/90 border-b-emerald-200/40 border-r-emerald-200/40 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_12px_40px_rgba(16,185,129,0.06)]">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/20 rounded-full translate-x-1/4 -translate-y-1/4 blur-3xl pointer-events-none"></div>
              <CardTitle className="text-2xl font-extrabold flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-[1.25rem] bg-white/20 flex items-center justify-center backdrop-blur-md border border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <Medal className="w-6 h-6 text-white" />
                </div>
                Riwayat Prestasi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-transparent">
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((ach: AchievementData, idx: number) => (
                    <div key={idx} className="flex gap-5 p-6 rounded-[2rem] border border-t-white/80 border-l-white/80 border-b-emerald-100/30 border-r-emerald-100/30 bg-white/50 backdrop-blur-xl hover:bg-white/80 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_8px_30px_rgba(16,185,129,0.1)] transition-all duration-300 group">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center shrink-0 border border-t-white border-l-white border-b-emerald-200/40 border-r-emerald-200/40 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <Award className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-lg leading-tight mb-1.5 truncate group-hover:text-emerald-700 transition-colors">{ach.nama_lomba}</h4>
                        <p className="text-xs text-slate-500 font-semibold mb-4 truncate">{ach.penyelenggara || "-"}</p>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Badge variant="secondary" className="bg-white/80 text-slate-600 border border-t-white border-l-white border-b-emerald-100/30 border-r-emerald-100/30 shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-[10px] font-bold px-3 py-1 rounded-xl backdrop-blur-md">
                            {ach.tingkat}
                          </Badge>
                          <Badge variant="secondary" className="bg-emerald-100/90 text-emerald-700 border border-t-white border-l-white border-b-emerald-200/50 border-r-emerald-200/50 shadow-[0_2px_10px_rgba(16,185,129,0.08)] text-[10px] font-bold px-3 py-1 rounded-xl backdrop-blur-md">
                            Juara {ach.peringkat}
                          </Badge>
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 ml-auto">
                            <Calendar className="w-4 h-4" /> {new Date(ach.tanggal).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-white/60 backdrop-blur-md rounded-3xl flex items-center justify-center mb-5 border border-t-white border-l-white border-b-emerald-100/50 border-r-emerald-100/50 shadow-[0_8px_30px_rgba(16,185,129,0.06)]">
                    <Medal className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Belum ada riwayat prestasi yang dicatatkan.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}