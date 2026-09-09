'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Save, Loader2, CalendarCheck, Users, Search, Plus, X, ChevronsUpDown, Check, Filter, Info } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// Import Action
import { 
  submitPerkaderanAttendance, 
  fetchPerkaderanPresensiSetup, 
  fetchMentorUnregisteredStudents, 
  enrollStudentToPerkaderanMentor 
} from "@/actions/perkaderanAction"

interface JenjangOption {
  id: number;
  nama_jenjang: string;
  kategori: string;
}

interface StudentData {
  id: number;
  student_name: string;
  student_class: string;
}

interface AttendanceState {
  status: string;
  notes: string;
}

interface SearchStudent {
  id: string;
  name: string;
  class: string;
}

interface ExistingAttendanceRecord {
  perkaderan_student_id: number;
  status: string;
  keterangan: string | null;
}

export default function PerkaderanAttendanceClient({ 
  perkaderans
}: { 
  perkaderans: JenjangOption[]
}) {
  const router = useRouter()
  
  // State Filter (Paginasi dihapus)
  const [selectedPerkaderanId, setSelectedPerkaderanId] = useState<string>("")
  const [selectedKelas, setSelectedKelas] = useState<string>("all")
  const [tanggal, setTanggal] = useState(new Date().toISOString().substring(0, 10))
  const [searchQuery, setSearchQuery] = useState("")

  // State Data Server
  const [students, setStudents] = useState<StudentData[]>([])
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // State Input & Presensi
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceState>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // State Modal Tambah Peserta
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [unregisteredStudents, setUnregisteredStudents] = useState<SearchStudent[]>([])
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [selectedNewStudent, setSelectedNewStudent] = useState<string>("")
  const [isEnrolling, setIsEnrolling] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

  // Fetch Data Presensi & Siswa (Limit di set ke 'all')
  useEffect(() => {
    if (!selectedPerkaderanId) return;

    let isMounted = true;

    const loadData = async () => {
      setLoadingData(true)
      try {
        const res = await fetchPerkaderanPresensiSetup(selectedPerkaderanId, selectedKelas, "all", 1, tanggal)
        
        if (isMounted) {
          if (res?.error) {
            toast.error(res.error)
          } else if (res?.success && res.data) {
            setStudents(res.data.students || [])
            setAvailableClasses(res.data.available_classes || [])

            const existingList = res.data.existing_attendance || []
            if (existingList.length > 0) {
              setIsEditMode(true)
              const existingData: Record<string, AttendanceState> = {}
              existingList.forEach((att: ExistingAttendanceRecord) => {
                existingData[att.perkaderan_student_id.toString()] = {
                  status: att.status.toUpperCase(),
                  notes: att.keterangan || ""
                }
              })
              setAttendanceData(existingData)
            } else {
              setIsEditMode(false)
              setAttendanceData({}) 
            }
          }
        }
      } catch (error) {
        if (isMounted) toast.error("Gagal menarik data peserta dari server.")
      } finally {
        if (isMounted) setLoadingData(false)
      }
    }

    loadData()

    return () => {
      isMounted = false;
    }
  }, [selectedPerkaderanId, selectedKelas, tanggal, refreshTrigger])

  // Fetch Data Siswa yang BELUM terdaftar
  useEffect(() => {
    if (!selectedPerkaderanId || !isAddModalOpen) return;

    let isMounted = true;

    const fetchUnregistered = async () => {
      try {
        const res = await fetchMentorUnregisteredStudents(selectedPerkaderanId, studentSearchQuery)
        if (isMounted && res?.success) setUnregisteredStudents(res.data)
      } catch (e) {
      }
    }

    const delay = setTimeout(() => {
      fetchUnregistered()
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delay);
    };
  }, [studentSearchQuery, isAddModalOpen, selectedPerkaderanId])

  // Handler Pendaftaran Susulan
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNewStudent || !selectedPerkaderanId) return

    setIsEnrolling(true)
    const res = await enrollStudentToPerkaderanMentor(selectedPerkaderanId, [selectedNewStudent])
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Siswa berhasil ditambahkan!")
      setIsAddModalOpen(false)
      setSelectedNewStudent("")
      setStudentSearchQuery("")
      setRefreshTrigger(prev => prev + 1)
    }
    setIsEnrolling(false)
  }

  // Handler Status & Notes
  const handleStatusChange = (id: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [id]: { ...prev[id] || { status: 'HADIR', notes: '' }, status } }));
  }

  const handleNotesChange = (id: string, notes: string) => {
    setAttendanceData(prev => ({ ...prev, [id]: { ...prev[id] || { status: 'HADIR', notes: '' }, notes } }));
  }

  const filteredStudents = students.filter(ps => 
    !searchQuery || 
    ps.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ps.student_class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Submit Presensi
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
      toast.success(isEditMode ? "Perubahan presensi berhasil disimpan!" : "Presensi berhasil disimpan!")
      router.push("/mentor/perkaderan/riwayat") 
    }
    setIsSubmitting(false)
  }

  const selectedStudentObj = unregisteredStudents.find(s => s.id === selectedNewStudent)

  return (
    <div className="space-y-6 mt-6 pb-12">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center justify-between text-slate-800 gap-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" /> Pengaturan Sesi & Filter
            </div>
            {selectedPerkaderanId && (
               <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                 <Plus className="w-4 h-4 mr-1" /> Tambah Peserta
               </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Pilih Jenjang Perkaderan</Label>
              <Select value={selectedPerkaderanId} onValueChange={(val) => { setSelectedPerkaderanId(val); setSelectedKelas("all"); }}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                  <SelectValue placeholder="-- Pilih Jenjang Perkaderan --" />
                </SelectTrigger>
                <SelectContent>
                  {perkaderans.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nama_jenjang} ({p.kategori})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase"><Filter className="w-3 h-3 inline" /> Kelas</label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas} disabled={!selectedPerkaderanId}>
                <SelectTrigger className="bg-slate-50 h-10"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {availableClasses.map(kelas => <SelectItem key={kelas} value={kelas}>Kelas {kelas}</SelectItem>)}
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
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama santri..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
              
              {isEditMode && !loadingData && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-800 text-sm">Mode Edit Presensi</h4>
                    <p className="text-xs text-blue-700 mt-1">Presensi untuk filter kelas dan tanggal ini sudah pernah disimpan. Anda dapat mengubah status kehadiran saat ini dan menyimpan ulang perubahannya.</p>
                  </div>
                </div>
              )}

              {loadingData ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      Tidak ada santri yang terdaftar di kelas/filter ini.
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
                              <p className="font-bold text-slate-900">{ps.student_name}</p>
                              <p className="text-xs text-slate-500 font-medium">Kelas {ps.student_class}</p>
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
                              placeholder="Catatan opsional..." 
                              className="bg-white border-slate-200"
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end sticky bottom-6 z-10">
            <Button 
              type="submit" 
              size="lg" 
              className={cn(
                "text-white shadow-xl h-12 px-8 rounded-xl font-bold w-full md:w-auto",
                isEditMode ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
              )}
              disabled={isSubmitting || students.length === 0}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="mr-2 h-5 w-5" /> {isEditMode ? "Simpan Perubahan Presensi" : "Simpan Presensi"}</>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Modal Tambah Peserta Susulan */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">Tambah Peserta Susulan</h3>
              <button onClick={() => { setIsAddModalOpen(false); setSelectedNewStudent(""); }} className="text-slate-400 hover:text-slate-700" disabled={isEnrolling}><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleEnroll} className="p-6 space-y-6">
              <div className="space-y-3 flex flex-col">
                <Label className="text-slate-700 font-semibold text-sm">Cari Santri dari Data Induk</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between font-normal bg-white h-12 text-left" disabled={isEnrolling}>
                      {selectedStudentObj ? `${selectedStudentObj.name} - Kelas ${selectedStudentObj.class}` : "Ketik nama santri..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0 z-[110]" align="start">
                    <Command>
                      <CommandInput placeholder="Cari nama atau kelas..." onValueChange={setStudentSearchQuery} />
                      <CommandList>
                        <CommandEmpty>Siswa tidak ditemukan atau sudah terdaftar.</CommandEmpty>
                        <CommandGroup>
                          {unregisteredStudents.map((s) => (
                            <CommandItem key={s.id} value={`${s.name} ${s.class}`} onSelect={() => { setSelectedNewStudent(s.id); setOpenCombobox(false); }} className="cursor-pointer py-3">
                              <Check className={cn("mr-2 h-4 w-4", selectedNewStudent === s.id ? "opacity-100 text-emerald-600" : "opacity-0")} />
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-800">{s.name}</span>
                                <span className="text-xs text-slate-500">Kelas {s.class}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex justify-end gap-3 pt-2 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={isEnrolling}>Batal</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]" disabled={isEnrolling || !selectedNewStudent}>
                  {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Tambahkan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}