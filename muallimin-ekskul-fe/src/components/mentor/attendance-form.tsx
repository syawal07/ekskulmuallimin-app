'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { submitAttendance, deleteAttendanceSession } from "@/actions/attendanceAction"
import { createStudentByMentor } from "@/actions/studentAction"
import { Save, Loader2, Trash2, Camera, ChevronLeft, ChevronRight, Search, Plus, X, Check, ChevronsUpDown, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Student = {
  id: string
  name: string
  class: string
  nis: string | null
}

type AttendanceRecord = {
  studentId: string
  status: "HADIR" | "SAKIT" | "IZIN" | "ALPHA"
  notes?: string | null
  proofImageUrl?: string | null
}

export default function AttendanceForm({ 
  students, 
  allStudents = [],
  exculId,
  exculName,
  initialDate, 
  initialData = [] 
}: { 
  students: Student[], 
  allStudents?: Student[],
  exculId: string,
  exculName: string
  initialDate?: string
  initialData?: AttendanceRecord[]
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [localData, setLocalData] = useState<Record<string, { status: string, notes: string }>>({})
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [selectedNewStudent, setSelectedNewStudent] = useState<string>("")

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const existingProof = initialData.find(d => d.proofImageUrl)?.proofImageUrl

  const defaultDate = initialDate 
    ? typeof initialDate === 'string' ? initialDate.substring(0, 10) : new Date(initialDate).toISOString().substring(0, 10)
    : new Date().toISOString().substring(0, 10)

  const getInitialStatus = (studentId: string) => {
    const record = initialData.find(r => r.studentId === studentId)
    return record ? record.status : "HADIR"
  }

  const getInitialNotes = (studentId: string) => {
    const record = initialData.find(r => r.studentId === studentId)
    return record?.notes || ""
  }

  const getCurrentStatus = (studentId: string) => {
    if (localData[studentId]?.status) return localData[studentId].status
    return getInitialStatus(studentId)
  }

  const getCurrentNotes = (studentId: string) => {
    if (localData[studentId]?.notes !== undefined) return localData[studentId].notes
    return getInitialNotes(studentId)
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setLocalData(prev => ({
      ...prev,
      [studentId]: {
        status,
        notes: prev[studentId]?.notes ?? getInitialNotes(studentId)
      }
    }))
  }

  const handleNotesChange = (studentId: string, notes: string) => {
    setLocalData(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status ?? getInitialStatus(studentId),
        notes
      }
    }))
  }

  const handleBulkStatus = (status: "HADIR" | "ALPHA") => {
    setLocalData(prev => {
      const updatedData = { ...prev }
      students.forEach(student => {
        updatedData[student.id] = {
          status: status,
          notes: prev[student.id]?.notes ?? getInitialNotes(student.id)
        }
      })
      return updatedData
    })
    toast.success(`Berhasil mengatur semua santri menjadi ${status === 'HADIR' ? 'Hadir' : 'Alpha'}`)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    const file = formData.get("proofImage") as File
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto terlalu besar! Maksimal 5MB.")
      setIsSubmitting(false)
      return
    }

    const result = await submitAttendance(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteAttendanceSession(defaultDate, exculId)
    
    if (res?.error) {
      toast.error(res.error)
      setIsDeleting(false)
      setIsDeleteOpen(false)
    } else {
      toast.success("Sesi berhasil dihapus")
    }
  }

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedNewStudent) {
      toast.error("Silakan cari dan pilih nama santri dari daftar.")
      return
    }

    setIsAddingStudent(true)
    const formData = new FormData(e.currentTarget)
    formData.append("student_id", selectedNewStudent)
    
    const res = await createStudentByMentor(null, formData)
    
    if (res?.error) {
      toast.error(res?.error)
    } else {
      toast.success("Siswa berhasil ditambahkan ke kelas Ekskul ini!")
      setIsAddModalOpen(false)
      setSelectedNewStudent("")
    }
    setIsAddingStudent(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="exculId" value={exculId} />
        
        <div className="hidden">
          {students.map(s => {
            if (paginatedStudents.find(p => p.id === s.id)) return null
            return (
              <div key={`hidden-${s.id}`}>
                <input name={`status-${s.id}`} value={getCurrentStatus(s.id)} readOnly />
                <input name={`notes-${s.id}`} value={getCurrentNotes(s.id)} readOnly />
              </div>
            )
          })}
        </div>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50 overflow-hidden rounded-2xl">
          <div className="h-2 w-full bg-primary" />
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="flex items-center gap-3 text-slate-800 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              Informasi Sesi Kegiatan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas Ekskul</Label>
                  <p className="text-lg font-bold text-slate-800 mt-1">{exculName}</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tanggal Kegiatan</Label>
                  <Input 
                    type="date" 
                    name="date" 
                    defaultValue={defaultDate} 
                    readOnly={!!initialDate}
                    className={cn(
                      "h-11 font-medium text-slate-700 w-full",
                      initialDate ? "bg-slate-50 border-transparent cursor-not-allowed" : "bg-white border-slate-200 hover:border-primary/50 transition-colors cursor-pointer"
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Dokumentasi (Opsional)</Label>
                <div className="flex-1 relative group rounded-xl border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50 hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center min-h-[160px] p-4 shadow-sm">
                  
                  <Input 
                    type="file" 
                    name="proofImage" 
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {existingProof ? (
                    <div className="flex flex-col items-center justify-center gap-3 w-full h-full z-0">
                      <div className="absolute inset-0 w-full h-full opacity-20">
                        <Image src={existingProof} alt="Bukti blur" fill className="object-cover blur-sm" />
                      </div>
                      <div className="relative w-4/5 h-32 rounded-lg overflow-hidden shadow-md border-2 border-white">
                        <Image src={existingProof} alt="Bukti Sesi" fill className="object-cover" />
                      </div>
                      <span className="relative z-0 text-xs font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full shadow-sm">
                        Ketuk untuk mengganti foto
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400 z-0">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100">
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600">Unggah Foto Kegiatan</p>
                        <p className="text-xs text-slate-400 mt-1">Format JPG/PNG/WEBP, Maksimal 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-slate-800 whitespace-nowrap">
                  Daftar Siswa ({filteredStudents.length})
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3">
                  <Button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Siswa
                  </Button>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Cari nama atau kelas..." 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-primary"
                    />
                  </div>
                  
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="h-9 w-full sm:w-auto rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
                  >
                    <option value={10}>10 Baris</option>
                    <option value={25}>25 Baris</option>
                    <option value={50}>50 Baris</option>
                    <option value={100}>100 Baris</option>
                    <option value={99999}>Semua</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => handleBulkStatus("HADIR")}
                    className="flex-1 sm:flex-none border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 bg-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Hadir Semua
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => handleBulkStatus("ALPHA")}
                    className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 bg-white"
                  >
                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                    Alpha Semua
                  </Button>
                </div>
                
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full whitespace-nowrap self-end sm:self-auto">
                  Halaman {currentPage}/{totalPages}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              {paginatedStudents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-500 font-medium">Data siswa tidak ditemukan.</p>
                </div>
              ) : (
                paginatedStudents.map((student, index) => (
                  <div key={student.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col gap-4">
                    
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-base leading-tight line-clamp-1">{student.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Kelas {student.class} {student.nis ? ` • NIS: ${student.nis}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      
                      <div className="flex-1">
                        <RadioGroup 
                          value={getCurrentStatus(student.id)} 
                          onValueChange={(val) => handleStatusChange(student.id, val)}
                          name={`status-${student.id}`} 
                          className="grid grid-cols-4 gap-2"
                        >
                          <div className="relative">
                            <RadioGroupItem value="HADIR" id={`h-${student.id}`} className="peer sr-only" />
                            <Label htmlFor={`h-${student.id}`} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 border-slate-100 cursor-pointer hover:bg-green-50 peer-data-[state=checked]:bg-green-50 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-700 transition-all font-semibold text-xs sm:text-sm text-slate-500">
                              Hadir
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="IZIN" id={`i-${student.id}`} className="peer sr-only" />
                            <Label htmlFor={`i-${student.id}`} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 border-slate-100 cursor-pointer hover:bg-yellow-50 peer-data-[state=checked]:bg-yellow-50 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:text-yellow-700 transition-all font-semibold text-xs sm:text-sm text-slate-500">
                              Izin
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="SAKIT" id={`s-${student.id}`} className="peer sr-only" />
                            <Label htmlFor={`s-${student.id}`} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 border-slate-100 cursor-pointer hover:bg-blue-50 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-700 transition-all font-semibold text-xs sm:text-sm text-slate-500">
                              Sakit
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="ALPHA" id={`a-${student.id}`} className="peer sr-only" />
                            <Label htmlFor={`a-${student.id}`} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 border-slate-100 cursor-pointer hover:bg-red-50 peer-data-[state=checked]:bg-red-50 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:text-red-700 transition-all font-semibold text-xs sm:text-sm text-slate-500">
                              Alpha
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="w-full md:w-1/3 xl:w-1/4">
                        <Input 
                          name={`notes-${student.id}`} 
                          value={getCurrentNotes(student.id)}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          placeholder="Tambah catatan..." 
                          className="bg-slate-50/50 border-slate-200 focus-visible:ring-primary h-full min-h-[44px] text-sm"
                        />
                      </div>
                      
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
                <Button
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
                </Button>
                <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="sticky bottom-6 z-10 flex flex-col-reverse md:flex-row justify-end gap-3">
          {initialDate && (
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive"
                  size="lg"
                  className="w-full md:w-auto font-bold h-12 px-8 rounded-xl shadow-lg shadow-red-500/20"
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5" />}
                  Hapus Sesi
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600 text-xl">Hapus Sesi Presensi?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan menghapus data presensi untuk tanggal <b>{initialDate}</b>.<br/>
                    Tindakan ini tidak bisa dibatalkan dan data akan hilang permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete()
                    }}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus Sesi"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button 
            type="submit" 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 w-full md:w-auto font-bold h-12 px-8 rounded-xl"
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="mr-2 h-5 w-5" /> {initialDate ? "Simpan Perubahan" : "Simpan Presensi"}</>
            )}
          </Button>
        </div>
      </form>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">Tambahkan Siswa ke Kelas</h3>
              <button 
                type="button" 
                onClick={() => { setIsAddModalOpen(false); setSelectedNewStudent(""); }} 
                className="text-slate-400 hover:text-slate-700 transition-colors"
                disabled={isAddingStudent}
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-6">
              <input type="hidden" name="exculId" value={exculId} />
              
              <div className="space-y-3 flex flex-col">
                <Label className="text-slate-700 font-semibold">Cari Data Santri <span className="text-red-500">*</span></Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between font-normal bg-white h-12 text-left"
                      disabled={isAddingStudent}
                    >
                      {selectedNewStudent && allStudents
                        ? (() => {
                            const s = allStudents.find((st) => st.id === selectedNewStudent)
                            return s ? `${s.name} - Kelas ${s.class}` : "Pilih santri..."
                          })()
                        : "Ketik nama santri..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0 z-[110]" align="start">
                    <Command>
                      <CommandInput placeholder="Cari berdasarkan nama atau kelas..." />
                      <CommandList>
                        <CommandEmpty>Nama santri tidak ditemukan di Data Induk.</CommandEmpty>
                        <CommandGroup>
                          {allStudents?.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={`${s.name} ${s.class}`}
                              onSelect={() => {
                                setSelectedNewStudent(s.id)
                                setOpenCombobox(false)
                              }}
                              className="cursor-pointer py-3"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedNewStudent === s.id ? "opacity-100 text-emerald-600" : "opacity-0"
                                )}
                              />
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
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Pilih nama dari Data Induk Madrasah. Jika nama santri benar-benar tidak ada di pencarian, silakan hubungi Admin Sekolah.
                </p>
              </div>
              
              <div className="pt-2 flex justify-end gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setIsAddModalOpen(false); setSelectedNewStudent(""); }}
                  disabled={isAddingStudent}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[130px] h-11"
                  disabled={isAddingStudent || !selectedNewStudent}
                >
                  {isAddingStudent ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Tambahkan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}