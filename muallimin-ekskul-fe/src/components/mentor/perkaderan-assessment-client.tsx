'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Save, Loader2, Award, Users, Plus, X, ChevronsUpDown, Check, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// Import Actions
import { 
  savePerkaderanAssessment, 
  fetchPerkaderanAssessmentSetup, 
  fetchMentorUnregisteredStudents, 
  enrollStudentToPerkaderanMentor 
} from "@/actions/perkaderanAction"

interface JenjangOption {
  id: number;
  nama_jenjang: string;
  kategori: string;
}

interface AssessmentData {
  perkaderan_student_id: number;
  student_name: string;
  student_class: string;
  nilai: number | null;
  catatan: string;
}

interface SearchStudent {
  id: string;
  name: string;
  class: string;
}

export default function PerkaderanAssessmentClient({ 
  perkaderans
}: { 
  perkaderans: JenjangOption[]
}) {
  const router = useRouter()
  
  // State Filter & Paginasi
  const [selectedPerkaderanId, setSelectedPerkaderanId] = useState<string>("")
  const [selectedKelas, setSelectedKelas] = useState<string>("all")
  const [limit, setLimit] = useState("10")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // State Data Server
  const [assessments, setAssessments] = useState<AssessmentData[]>([])
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0) // State pemicu refresh tabel

  // State Input & Loading Simpan
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [localData, setLocalData] = useState<Record<number, { nilai: string, catatan: string }>>({})

  // State Modal Tambah Peserta
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [unregisteredStudents, setUnregisteredStudents] = useState<SearchStudent[]>([])
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [selectedNewStudent, setSelectedNewStudent] = useState<string>("")
  const [isEnrolling, setIsEnrolling] = useState(false)

  // Fetch Data Penilaian (Aman dari Linter)
  useEffect(() => {
    if (!selectedPerkaderanId) return;

    let isMounted = true;
    
    const loadData = async () => {
      setLoadingData(true)
      try {
        const res = await fetchPerkaderanAssessmentSetup(selectedPerkaderanId, selectedKelas, limit, page)
        
        if (isMounted) {
          if (res?.error) {
            toast.error(res.error)
          } else if (res?.success && res.data) {
            setAssessments(res.data.assessments || [])
            setAvailableClasses(res.data.available_classes || [])
            setTotalPages(res.data.meta?.last_page || 1)
          }
        }
      } catch (e) {
        if (isMounted) toast.error("Gagal mengambil data penilaian.")
      } finally {
        if (isMounted) setLoadingData(false)
      }
    }

    loadData()

    return () => {
      isMounted = false; 
    }
  }, [selectedPerkaderanId, selectedKelas, limit, page, refreshTrigger])

  // Fetch Data Siswa yang BELUM terdaftar
  useEffect(() => {
    if (!selectedPerkaderanId || !isAddModalOpen) return;

    let isMounted = true;

    const fetchUnregistered = async () => {
      try {
        const res = await fetchMentorUnregisteredStudents(selectedPerkaderanId, studentSearchQuery)
        if (isMounted && res?.success) setUnregisteredStudents(res.data)
      } catch (e) { }
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
      setRefreshTrigger(prev => prev + 1) // Trigger refresh data tabel
    }
    setIsEnrolling(false)
  }

  // Handler Input Penilaian
  const handleInputChange = (id: number, field: 'nilai' | 'catatan', value: string) => {
    setLocalData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { 
          nilai: assessments.find(a => a.perkaderan_student_id === id)?.nilai?.toString() || "", 
          catatan: assessments.find(a => a.perkaderan_student_id === id)?.catatan || "" 
        }),
        [field]: value
      }
    }))
  }

  const getVal = (id: number, field: 'nilai' | 'catatan', originalValue: string | number | null | undefined) => {
    if (localData[id] && localData[id][field] !== undefined) {
      return localData[id][field]
    }
    return originalValue || ""
  }

  const handleSave = async (studentId: number) => {
    const original = assessments.find(a => a.perkaderan_student_id === studentId)
    const nilai = getVal(studentId, 'nilai', original?.nilai)
    const catatan = getVal(studentId, 'catatan', original?.catatan)

    if (nilai === "" || isNaN(Number(nilai)) || Number(nilai) < 0 || Number(nilai) > 100) {
      toast.error("Nilai wajib diisi berupa angka antara 0 - 100")
      return
    }

    setLoadingId(studentId)
    const res = await savePerkaderanAssessment(studentId, Number(nilai), String(catatan))
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Nilai berhasil disimpan!")
    }
    setLoadingId(null)
  }

  const selectedStudentObj = unregisteredStudents.find(s => s.id === selectedNewStudent)

  return (
    <div className="space-y-6 mt-6 pb-12">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center justify-between text-slate-800 gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" /> Pengaturan Penilaian
            </div>
            {selectedPerkaderanId && (
               <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                 <Plus className="w-4 h-4 mr-1" /> Tambah Peserta
               </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Pilih Jenjang Perkaderan</Label>
              <Select value={selectedPerkaderanId} onValueChange={(val) => { setSelectedPerkaderanId(val); setSelectedKelas("all"); setPage(1); }}>
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
              <Select value={selectedKelas} onValueChange={(val) => { setSelectedKelas(val); setPage(1); }} disabled={!selectedPerkaderanId}>
                <SelectTrigger className="bg-slate-50 h-10"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {availableClasses.map(kelas => <SelectItem key={kelas} value={kelas}>Kelas {kelas}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Baris / Halaman</label>
              <Select value={limit} onValueChange={(val) => { setLimit(val); setPage(1); }} disabled={!selectedPerkaderanId}>
                <SelectTrigger className="bg-slate-50 h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Baris</SelectItem>
                  <SelectItem value="25">25 Baris</SelectItem>
                  <SelectItem value="50">50 Baris</SelectItem>
                  <SelectItem value="all">Semua Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPerkaderanId && (
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Daftar Santri & Input Nilai
            </CardTitle>
          </CardHeader>
          
          {loadingData ? (
             <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Nama Santri</th>
                    <th className="px-6 py-4 w-32">Nilai (0-100)</th>
                    <th className="px-6 py-4 w-1/3">Catatan Perkembangan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.length > 0 ? (
                    assessments.map((item) => (
                      <tr key={item.perkaderan_student_id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{item.student_name}</div>
                          <div className="text-xs text-slate-500 mt-1">Kelas {item.student_class}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Input 
                            type="number" 
                            min={0} 
                            max={100}
                            placeholder="0"
                            value={getVal(item.perkaderan_student_id, 'nilai', item.nilai)}
                            onChange={(e) => handleInputChange(item.perkaderan_student_id, 'nilai', e.target.value)}
                            className="bg-white text-center font-bold"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input 
                            placeholder="Tambahkan catatan (opsional)..."
                            value={getVal(item.perkaderan_student_id, 'catatan', item.catatan)}
                            onChange={(e) => handleInputChange(item.perkaderan_student_id, 'catatan', e.target.value)}
                            className="bg-white"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(item.perkaderan_student_id)}
                            disabled={loadingId === item.perkaderan_student_id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {loadingId === item.perkaderan_student_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} 
                            Simpan
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        Belum ada santri yang terdaftar di filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && !loadingData && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <span className="text-sm font-medium text-slate-500">Halaman {page} dari {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="bg-white"><ChevronLeft className="w-4 h-4 mr-1"/> Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-white">Next <ChevronRight className="w-4 h-4 ml-1"/></Button>
              </div>
            </div>
          )}
        </Card>
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