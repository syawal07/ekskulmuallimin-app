'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, Loader2, CalendarCheck, Users, Search } from "lucide-react"
import { toast } from "sonner"
import { submitPerkaderanAttendance } from "@/actions/perkaderanAction"

interface PerkaderanProps {
  id: string | number;
  nama_jenjang: string;
  kategori: string;
}

interface StudentProps {
  id: string | number;
  student?: {
    name: string;
    class: string;
  };
}

interface AttendanceState {
  status: string;
  notes: string;
}

export default function PerkaderanAttendanceClient({ 
  perkaderans, 
  selectedPerkaderanId,
  students 
}: { 
  perkaderans: PerkaderanProps[],
  selectedPerkaderanId: string | null,
  students: StudentProps[]
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [tanggal, setTanggal] = useState(new Date().toISOString().substring(0, 10))
  
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceState>>({})

  const handlePerkaderanChange = (val: string) => {
    router.push(`/mentor/perkaderan/presensi?perkaderan_id=${val}`)
  }

  const handleStatusChange = (id: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [id]: { ...prev[id] || { status: 'HADIR', notes: '' }, status } }));
  }

  const handleNotesChange = (id: string, notes: string) => {
    setAttendanceData(prev => ({ ...prev, [id]: { ...prev[id] || { status: 'HADIR', notes: '' }, notes } }));
  }

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(ps => 
      ps.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ps.student?.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const safePayload = new FormData()
    safePayload.append("perkaderanId", selectedPerkaderanId!)
    safePayload.append("date", tanggal)
    
    students.forEach(s => {
      const studentId = s.id.toString()
      const data = attendanceData[studentId] || { status: 'HADIR', notes: '' }
      
      safePayload.append(`status-${studentId}`, data.status)
      if (data.notes) {
        safePayload.append(`notes-${studentId}`, data.notes)
      }
    })

    const result = await submitPerkaderanAttendance(safePayload)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Presensi berhasil disimpan!")
      router.push("/mentor/perkaderan/riwayat") 
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <CalendarCheck className="w-5 h-5 text-blue-600" /> Pengaturan Sesi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Pilih Jenjang Perkaderan</Label>
              <Select value={selectedPerkaderanId || ""} onValueChange={handlePerkaderanChange}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11">
                  <SelectValue placeholder="-- Pilih Jenjang Perkaderan --" />
                </SelectTrigger>
                <SelectContent>
                  {perkaderans.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nama_jenjang} ({p.kategori})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPerkaderanId && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Daftar Santri
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama santri..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <Input 
                  type="date" 
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full sm:w-40 bg-slate-50"
                  required
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Tidak ada santri yang sesuai dengan pencarian Anda.
                  </div>
                ) : (
                  filteredStudents.map((ps, index) => {
                    const studentId = ps.id.toString();
                    const currentStatus = attendanceData[studentId]?.status || 'HADIR';
                    const currentNotes = attendanceData[studentId]?.notes || '';

                    return (
                      <div key={ps.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors flex flex-col xl:flex-row justify-between gap-4">
                        <div className="flex items-center gap-4 w-full xl:w-[30%]">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{ps.student?.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{ps.student?.class}</p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                          <RadioGroup 
                            value={currentStatus} 
                            onValueChange={(val) => handleStatusChange(studentId, val)}
                            className="flex flex-row items-center gap-2"
                          >
                            {['HADIR', 'IZIN', 'SAKIT', 'ALPHA'].map((status) => {
                              const colors: Record<string, string> = {
                                HADIR: "peer-data-[state=checked]:bg-green-100 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-700 hover:bg-green-50",
                                IZIN: "peer-data-[state=checked]:bg-yellow-100 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:text-yellow-700 hover:bg-yellow-50",
                                SAKIT: "peer-data-[state=checked]:bg-blue-100 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-700 hover:bg-blue-50",
                                ALPHA: "peer-data-[state=checked]:bg-red-100 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:text-red-700 hover:bg-red-50"
                              }
                              return (
                                <div key={status} className="relative">
                                  <RadioGroupItem value={status} id={`${status}-${ps.id}`} className="peer sr-only" />
                                  <Label htmlFor={`${status}-${ps.id}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer transition-all font-semibold text-sm text-slate-600 ${colors[status]}`}>
                                    {status}
                                  </Label>
                                </div>
                              )
                            })}
                          </RadioGroup>
                        </div>

                        <div className="w-full xl:w-[25%]">
                          <Input 
                            value={currentNotes}
                            onChange={(e) => handleNotesChange(studentId, e.target.value)}
                            placeholder="Catatan..." 
                            className="bg-white border-slate-200"
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end sticky bottom-6 z-10">
            <Button 
              type="submit" 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl h-12 px-8 rounded-xl font-bold w-full md:w-auto"
              disabled={isSubmitting || students.length === 0}
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-5 w-5" /> Simpan Presensi</>}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}