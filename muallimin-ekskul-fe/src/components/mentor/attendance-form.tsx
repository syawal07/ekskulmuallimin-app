'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { submitAttendance, deleteAttendanceSession } from "@/actions/attendanceAction"
import { createStudentByMentor } from "@/actions/studentAction"
import { Save, Loader2, Trash2, Camera, ChevronLeft, ChevronRight, Search, Plus, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
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
  exculId,
  exculName,
  initialDate, 
  initialData = [] 
}: { 
  students: Student[], 
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
  const itemsPerPage = 10 

  const [localData, setLocalData] = useState<Record<string, { status: string, notes: string }>>({})
  
  // --- PENANDA: STATE UNTUK MODAL TAMBAH SISWA ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddingStudent, setIsAddingStudent] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const file = formData.get("proofImage") as File
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto terlalu besar! Maksimal 2MB.")
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

  // --- PENANDA: FUNGSI SUBMIT TAMBAH SISWA ---
  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAddingStudent(true)
    const formData = new FormData(e.currentTarget)
    
    const res = await createStudentByMentor(null, formData)
    
    if (res?.error) {
      toast.error(res?.error)
    } else {
      toast.success("Siswa baru berhasil ditambahkan ke Ekskul ini!")
      setIsAddModalOpen(false)
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
        
        <Card className="border-t-4 border-t-primary shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Camera className="w-5 h-5 text-primary" />
              Info Kegiatan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-600">Kelas Ekskul</Label>
                  <Input value={exculName} disabled className="bg-slate-50 font-bold text-slate-800 border-slate-200 mt-1.5" />
                </div>
                <div>
                  <Label className="text-slate-600">Tanggal Kegiatan</Label>
                  <Input 
                    type="date" 
                    name="date" 
                    defaultValue={defaultDate} 
                    readOnly={!!initialDate} 
                    className={`border-slate-200 mt-1.5 ${initialDate ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`} 
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-600 mb-2 block">Bukti Foto Kegiatan (Opsional)</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <Input 
                    type="file" 
                    name="proofImage" 
                    accept="image/png, image/jpeg, image/jpg"
                    className="cursor-pointer bg-white"
                  />
                  <p className="text-xs text-slate-400 mt-2">Format: JPG/PNG, Max 2MB.</p>
                  {existingProof && (
                    <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden relative">
                        <Image src={existingProof} alt="Bukti" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">Foto Tersimpan</p>
                        <a href={existingProof} target="_blank" className="text-xs text-primary hover:underline">Lihat Full</a>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-slate-800 whitespace-nowrap">
                Daftar Siswa ({filteredStudents.length})
              </CardTitle>
              
              <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3">
                {/* --- PENANDA: TOMBOL TAMBAH SISWA BARU --- */}
                <Button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
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
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                  Hal {currentPage}/{totalPages}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {paginatedStudents.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  Data siswa tidak ditemukan.
                </div>
              ) : (
                paginatedStudents.map((student, index) => (
                  <div key={student.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4 w-full xl:w-[30%]">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-base line-clamp-1">{student.name}</p>
                          <p className="text-sm text-slate-500 font-medium">{student.class} {student.nis ? `• ${student.nis}` : ''}</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-x-auto pb-2 xl:pb-0">
                        <RadioGroup 
                          value={getCurrentStatus(student.id)} 
                          onValueChange={(val) => handleStatusChange(student.id, val)}
                          name={`status-${student.id}`} 
                          className="flex flex-row items-center gap-2 min-w-max"
                        >
                          <div className="relative">
                            <RadioGroupItem value="HADIR" id={`h-${student.id}`} className="peer sr-only" />
                            <Label htmlFor={`h-${student.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-green-50 peer-data-[state=checked]:bg-green-100 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-700 transition-all font-semibold text-sm text-slate-600">
                              <span className="w-2 h-2 rounded-full bg-green-500" /> Hadir
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="IZIN" id={`i-${student.id}`} className="peer sr-only" />
                            <Label htmlFor={`i-${student.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-yellow-50 peer-data-[state=checked]:bg-yellow-100 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:text-yellow-700 transition-all font-semibold text-sm text-slate-600">
                              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Izin
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="SAKIT" id={`s-${student.id}`} className="peer sr-only" />
                            <Label htmlFor={`s-${student.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 peer-data-[state=checked]:bg-blue-100 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-700 transition-all font-semibold text-sm text-slate-600">
                              <span className="w-2 h-2 rounded-full bg-blue-500" /> Sakit
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="ALPHA" id={`a-${student.id}`} className="peer sr-only" />
                            <Label htmlFor={`a-${student.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-red-50 peer-data-[state=checked]:bg-red-100 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:text-red-700 transition-all font-semibold text-sm text-slate-600">
                              <span className="w-2 h-2 rounded-full bg-red-500" /> Alpha
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="w-full xl:w-[25%] mt-2 xl:mt-0">
                        <Input 
                          name={`notes-${student.id}`} 
                          value={getCurrentNotes(student.id)}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          placeholder="Catatan..." 
                          className="bg-white border-slate-200 focus-visible:ring-primary h-10"
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

      {/* --- PENANDA: MODAL UI TAMBAH SISWA --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">Tambah Siswa Baru</h3>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 transition-colors"
                disabled={isAddingStudent}
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-5 space-y-4">
              <input type="hidden" name="exculId" value={exculId} />
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" required placeholder="Masukkan nama siswa" disabled={isAddingStudent} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="class" className="text-slate-700">Kelas <span className="text-red-500">*</span></Label>
                <Input id="class" name="class" required placeholder="Contoh: X IPA 1" disabled={isAddingStudent} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nis" className="text-slate-700">NIS / Nomor Induk (Opsional)</Label>
                <Input id="nis" name="nis" placeholder="Masukkan NIS jika ada" disabled={isAddingStudent} />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isAddingStudent}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                  disabled={isAddingStudent}
                >
                  {isAddingStudent ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}