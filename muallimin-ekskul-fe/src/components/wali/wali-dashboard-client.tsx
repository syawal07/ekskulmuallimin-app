"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCircle, Activity, CalendarCheck, BookOpen, Fingerprint, Award } from "lucide-react"

type StudentData = {
  id: string
  name: string
  nis: string
  class: string
  is_active: boolean
}

type ExculData = {
  id: string
  name: string
}

type AttendanceRecord = {
  id: string
  date: string
  status: 'hadir' | 'izin' | 'sakit' | 'alpha'
}

type AssessmentRecord = {
  id: string
  evaluation_date: string
  score: string
  description: string
}

interface WaliDashboardProps {
  student: StudentData | null
  excul: ExculData | null
  attendances: AttendanceRecord[]
  assessments: AssessmentRecord[]
}

export function WaliDashboardClient({ student, excul, attendances, assessments }: WaliDashboardProps) {
  
  if (!student) {
    return (
      <div className="flex h-[300px] items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="text-center space-y-3">
          <UserCircle className="w-16 h-16 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-lg">Data santri tidak ditemukan.</p>
          <p className="text-slate-400 text-sm">Silakan hubungi administrator sekolah.</p>
        </div>
      </div>
    )
  }

  // Kalkulasi Statistik Kehadiran
  const totalPertemuan = attendances.length;
  const totalHadir = attendances.filter(a => a.status.toLowerCase() === 'hadir').length;
  const persentaseHadir = totalPertemuan === 0 ? 0 : Math.round((totalHadir / totalPertemuan) * 100);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hadir': return <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200 px-3 py-1 rounded-full shadow-none font-bold">Hadir</Badge>
      case 'izin': return <Badge className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200 px-3 py-1 rounded-full shadow-none font-bold">Izin</Badge>
      case 'sakit': return <Badge className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200 px-3 py-1 rounded-full shadow-none font-bold">Sakit</Badge>
      case 'alpha': return <Badge className="bg-red-100 hover:bg-red-200 text-red-800 border-red-200 px-3 py-1 rounded-full shadow-none font-bold">Alpha</Badge>
      default: return <Badge variant="outline" className="px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. KARTU PROFIL SANTRI (HERO SECTION) */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden relative">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center text-white shrink-0">
              <UserCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1 text-white">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base font-medium text-blue-100">
                <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-lg"><Fingerprint className="w-4 h-4" /> NISN: {student.nis}</span>
                <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-lg"><BookOpen className="w-4 h-4" /> Kelas {student.class}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
            <div className="w-12 h-12 bg-white text-blue-700 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-0.5">Fokus Ekstrakurikuler</p>
              <p className="text-lg font-black text-white leading-none">{excul ? excul.name : 'Belum Terdaftar'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. GRID STATISTIK RINGKAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600 shrink-0"><CalendarCheck className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Total Pertemuan</p>
              <p className="text-2xl font-black text-slate-900">{totalPertemuan}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700 shrink-0"><Activity className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Hadir Mengikuti</p>
              <p className="text-2xl font-black text-slate-900">{totalHadir} <span className="text-sm font-medium text-slate-400">kali</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-700 shrink-0"><Activity className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Persentase Aktif</p>
              <p className="text-2xl font-black text-slate-900">{persentaseHadir}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. TABS DATA PRESENSI & PENILAIAN */}
      <Tabs defaultValue="presensi" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="presensi" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 py-2">Riwayat Presensi</TabsTrigger>
          <TabsTrigger value="penilaian" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 py-2">Hasil Evaluasi</TabsTrigger>
        </TabsList>

        <TabsContent value="presensi" className="mt-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
              <CardTitle className="text-xl text-slate-800">Catatan Kehadiran</CardTitle>
              <CardDescription className="text-slate-500">Detail rekam jejak kehadiran santri di setiap sesi ekstrakurikuler.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {attendances.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <CalendarCheck className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada data presensi yang dicatat oleh Mentor.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[500px]">
                    <TableHeader className="bg-slate-50">
                      <TableRow className="hover:bg-transparent border-slate-200">
                        <TableHead className="font-bold text-slate-700 pl-6 h-14">Tanggal Pertemuan</TableHead>
                        <TableHead className="font-bold text-slate-700 text-right pr-6 h-14">Status Kehadiran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendances.map((item) => (
                        <TableRow key={item.id} className="border-slate-100 transition-colors hover:bg-slate-50">
                          <TableCell className="font-semibold text-slate-700 pl-6 py-4">
                            {new Date(item.date).toLocaleDateString('id-ID', {
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell className="text-right pr-6 py-4">{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="penilaian" className="mt-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
              <CardTitle className="text-xl text-slate-800">Evaluasi Pembelajaran</CardTitle>
              <CardDescription className="text-slate-500">Nilai akhir dan catatan perkembangan dari Mentor pembimbing.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {assessments.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <BookOpen className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada evaluasi atau nilai yang dimasukkan.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader className="bg-slate-50">
                      <TableRow className="hover:bg-transparent border-slate-200">
                        <TableHead className="font-bold text-slate-700 pl-6 h-14 w-[200px]">Tanggal Evaluasi</TableHead>
                        <TableHead className="font-bold text-slate-700 text-center h-14 w-[120px]">Nilai Akhir</TableHead>
                        <TableHead className="font-bold text-slate-700 pr-6 h-14">Catatan Mentor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessments.map((item) => (
                        <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50">
                          <TableCell className="font-semibold text-slate-700 pl-6 py-5">
                             {new Date(item.evaluation_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-center py-5">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-xl border-2 border-blue-100">
                              {item.score}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-600 pr-6 py-5 leading-relaxed font-medium">
                            {item.description ? (
                              <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 inline-block w-full">{item.description}</span>
                            ) : (
                              <span className="text-slate-400 italic">Tidak ada catatan</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}