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
import { UserCircle, Activity, CalendarCheck, BookOpen, Fingerprint, Trophy, GraduationCap, LayoutGrid } from "lucide-react"

type StudentData = {
  id: string
  name: string
  nis: string
  nisn?: string | null
  class: string
  angkatan?: string | null
  foto?: string | null
  is_active: boolean
}

type ActivitySummary = {
  id: string
  name: string
  type: 'Ekskul' | 'Perkaderan'
  attendance_percentage: number
  score: string
}

type CombinedAttendance = {
  id: string
  activity_name: string
  type: 'Ekskul' | 'Perkaderan'
  date: string
  status: string
}

type CombinedAssessment = {
  id: string
  activity_name: string
  type: 'Ekskul' | 'Perkaderan'
  evaluation_date: string
  score: string
  description: string
}

interface WaliDashboardProps {
  student: StudentData | null
  activities: ActivitySummary[]
  attendances: CombinedAttendance[]
  assessments: CombinedAssessment[]
}

export function WaliDashboardClient({ student, activities, attendances, assessments }: WaliDashboardProps) {
  
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

  const totalActivities = activities.length
  const avgAttendance = totalActivities > 0 
    ? Math.round(activities.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / totalActivities)
    : 0

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hadir': return <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200 px-3 py-1 rounded-full shadow-none font-bold">Hadir</Badge>
      case 'izin': return <Badge className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200 px-3 py-1 rounded-full shadow-none font-bold">Izin</Badge>
      case 'sakit': return <Badge className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200 px-3 py-1 rounded-full shadow-none font-bold">Sakit</Badge>
      case 'alpha': return <Badge className="bg-red-100 hover:bg-red-200 text-red-800 border-red-200 px-3 py-1 rounded-full shadow-none font-bold">Alpha</Badge>
      default: return <Badge variant="outline" className="px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'Ekskul' ? <Trophy className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-inner">
              {student.foto ? (
                <img src={`/uploads/students/${student.foto}`} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12" />
              )}
            </div>
            <div className="space-y-1 text-white">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base font-medium text-blue-100">
                <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-lg">
                  <Fingerprint className="w-4 h-4" /> {student.nisn ? `NISN: ${student.nisn}` : `NIS: ${student.nis}`}
                </span>
                <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-lg">
                  <BookOpen className="w-4 h-4" /> Kelas {student.class}
                </span>
                {student.angkatan && (
                  <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-lg">
                    Angkatan {student.angkatan}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-700 shrink-0"><LayoutGrid className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Total Aktivitas Aktif</p>
              <p className="text-2xl font-black text-slate-900">{totalActivities} <span className="text-sm font-medium text-slate-400">program</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700 shrink-0"><Activity className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Rata-rata Kehadiran Total</p>
              <p className="text-2xl font-black text-slate-900">{avgAttendance}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ringkasan" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px] bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="ringkasan" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 py-2">Ringkasan</TabsTrigger>
          <TabsTrigger value="presensi" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 py-2">Riwayat Presensi</TabsTrigger>
          <TabsTrigger value="penilaian" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 py-2">Penilaian</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 font-medium">Belum ada aktivitas Ekskul atau Perkaderan yang terdaftar.</p>
              </div>
            ) : (
              activities.map((act) => (
                <Card key={act.id} className="border-slate-200 shadow-sm">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-white text-slate-600 border-slate-300 font-bold flex items-center gap-1.5 w-fit">
                          {getTypeIcon(act.type)} {act.type}
                        </Badge>
                        <CardTitle className="text-lg text-slate-800">{act.name}</CardTitle>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-black text-xl border-2 border-blue-100">
                        {act.score || '-'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm font-bold text-slate-500 mb-1">Persentase Kehadiran</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${act.attendance_percentage >= 80 ? 'bg-emerald-500' : act.attendance_percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${act.attendance_percentage}%` }}
                        />
                      </div>
                      <span className="font-black text-slate-700">{act.attendance_percentage}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="presensi" className="mt-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
              <CardTitle className="text-xl text-slate-800">Catatan Kehadiran Gabungan</CardTitle>
              <CardDescription className="text-slate-500">Detail rekam jejak kehadiran di seluruh Ekskul dan Perkaderan.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {attendances.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <CalendarCheck className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada data presensi yang dicatat oleh Mentor.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader className="bg-slate-50">
                      <TableRow className="hover:bg-transparent border-slate-200">
                        <TableHead className="font-bold text-slate-700 pl-6 h-14">Tanggal</TableHead>
                        <TableHead className="font-bold text-slate-700 h-14">Aktivitas</TableHead>
                        <TableHead className="font-bold text-slate-700 text-right pr-6 h-14">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendances.map((item) => (
                        <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50">
                          <TableCell className="font-semibold text-slate-700 pl-6 py-4">
                            {new Date(item.date).toLocaleDateString('id-ID', {
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{item.activity_name}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                {getTypeIcon(item.type)} {item.type}
                              </span>
                            </div>
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
              <CardTitle className="text-xl text-slate-800">Evaluasi Pembelajaran Gabungan</CardTitle>
              <CardDescription className="text-slate-500">Nilai akhir dari Mentor Ekskul dan Pembina Perkaderan.</CardDescription>
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
                        <TableHead className="font-bold text-slate-700 pl-6 h-14 w-[150px]">Tanggal</TableHead>
                        <TableHead className="font-bold text-slate-700 h-14 w-[200px]">Aktivitas</TableHead>
                        <TableHead className="font-bold text-slate-700 text-center h-14 w-[100px]">Nilai</TableHead>
                        <TableHead className="font-bold text-slate-700 pr-6 h-14">Catatan Mentor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessments.map((item) => (
                        <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50">
                          <TableCell className="font-semibold text-slate-700 pl-6 py-5">
                             {new Date(item.evaluation_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{item.activity_name}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                {getTypeIcon(item.type)} {item.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-5">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-black text-lg border border-blue-100">
                              {item.score}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-600 pr-6 py-5 leading-relaxed font-medium">
                            {item.description ? (
                              <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block w-full">{item.description}</span>
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