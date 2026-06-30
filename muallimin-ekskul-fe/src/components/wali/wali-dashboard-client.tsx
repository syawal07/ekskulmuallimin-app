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
      
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <User className="w-12 h-12 text-white/90" />
            </div>
            <div>
              <p className="text-blue-200 font-medium tracking-wide text-sm mb-1 uppercase">Profil Siswa</p>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">{profile.name || "Nama Siswa"}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full font-medium border border-white/10">
                  NIS: {profile.nis || "-"}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full font-medium border border-white/10">
                  Kelas {profile.class || "-"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-5 rounded-3xl text-center min-w-[200px]">
            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Tahun Ajaran</p>
            <p className="font-bold text-xl leading-none">{profile.tahun_pelajaran || "Aktif"}</p>
            <p className="text-sm font-medium text-blue-100 mt-2 bg-black/20 inline-block px-3 py-1 rounded-full">Semester {profile.semester || "Ganjil"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        <Card className="border-slate-100/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-white border-b border-slate-100 p-6">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              Laporan Ekstrakurikuler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            {exculs.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {exculs.map((ex: ExculData, idx: number) => (
                  <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{ex.name}</h4>
                      {ex.assessment?.score ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nilai Akhir</span>
                          <div className="bg-blue-600 text-white font-black px-4 py-1.5 rounded-full text-base shadow-md shadow-blue-600/20 flex items-center gap-2">
                            {ex.assessment.score} <span className="w-1 h-1 bg-white/50 rounded-full"></span> {ex.assessment.predicate}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-200 font-medium px-3 py-1 rounded-full">Belum dinilai</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Kehadiran
                        </p>
                        <p className="font-black text-slate-800 text-2xl">
                          {ex.attendance_summary?.hadir || 0}
                          <span className="text-sm font-medium text-slate-400 ml-1">/ {ex.attendance_summary?.total_meetings || 0}</span>
                        </p>
                      </div>
                      <div className="w-px h-12 bg-slate-200 mx-2"></div>
                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Persentase
                        </p>
                        <p className="font-black text-blue-600 text-2xl">
                          {ex.attendance_summary?.percentage || 0}%
                        </p>
                      </div>
                    </div>

                    {ex.assessment?.description && (
                      <div className="mt-5 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 relative">
                        <Sparkles className="w-4 h-4 text-blue-400 absolute top-4 right-4" />
                        <p className="text-sm text-slate-600 leading-relaxed font-medium pr-6">
                          &quot;{ex.assessment.description}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-slate-700 font-bold mb-1">Belum Ada Data</h4>
                <p className="text-slate-500 text-sm">Siswa tidak tercatat mengikuti ekstrakurikuler semester ini.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          
          <Card className="border-slate-100/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-white border-b border-slate-100 p-6">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                </div>
                Perkaderan (TKM)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {perkaderans.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {perkaderans.map((pk: PerkaderanData, idx: number) => (
                    <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-lg mb-1">{pk.jenjang}</h4>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            <User className="w-3 h-3" /> {pk.jabatan || 'Peserta'}
                          </span>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-none font-bold px-4 py-1.5 rounded-full">
                          {pk.status}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-1 flex flex-col justify-center">
                          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">Kehadiran</span>
                          <span className="font-black text-slate-800 text-2xl">{pk.attendance_summary?.percentage || 0}%</span>
                        </div>
                        
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
                          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">Nilai Akhir</span>
                          <div className="flex items-end gap-2">
                            <span className="font-black text-amber-600 text-2xl">{pk.assessment?.score || '-'}</span>
                            {pk.assessment?.predicate && (
                              <span className="font-bold text-amber-700/60 text-lg mb-0.5">{pk.assessment.predicate}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {pk.assessment?.description && (
                        <div className="mt-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 relative">
                          <Sparkles className="w-4 h-4 text-amber-400 absolute top-4 right-4" />
                          <p className="text-sm text-slate-600 leading-relaxed font-medium pr-6">
                            &quot;{pk.assessment.description}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <GraduationCap className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Belum ada catatan kepesertaan perkaderan.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden">
            <CardHeader className="bg-emerald-500 p-6 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl"></div>
              <CardTitle className="text-xl font-bold flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Medal className="w-5 h-5 text-white" />
                </div>
                Riwayat Prestasi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((ach: AchievementData, idx: number) => (
                    <div key={idx} className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100/50 transition-all group">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors">
                        <Award className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-base leading-tight mb-1">{ach.nama_lomba}</h4>
                        <p className="text-xs text-slate-500 font-medium mb-3">{ach.penyelenggara || "-"}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {ach.tingkat}
                          </Badge>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Juara {ach.peringkat}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 ml-auto">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(ach.tanggal).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Medal className="w-6 h-6 text-slate-300" />
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