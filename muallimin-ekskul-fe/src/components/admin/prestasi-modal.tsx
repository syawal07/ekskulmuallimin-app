'use client'

import { useState, useActionState, useEffect } from "react"
import { createAchievement, updateAchievement } from "@/actions/achievementAction"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus } from "lucide-react"
import SubmitButton from "./submit-button"

export interface StudentData {
  id: string;
  name: string;
  class: string;
}

export interface PrestasiData {
  id: number;
  student_id: string;
  nama_lomba: string;
  tingkat: string;
  peringkat: string;
  tanggal: string;
  penyelenggara?: string | null;
}

export default function PrestasiModal({ 
  initialData, 
  students 
}: { 
  initialData?: PrestasiData; 
  students: StudentData[]; 
}) {
  const [open, setOpen] = useState(false)
  const isEdit = !!initialData
  
  const [selectedStudent, setSelectedStudent] = useState<string>(initialData?.student_id || "")

  const action = isEdit && initialData ? updateAchievement.bind(null, initialData.id.toString()) : createAchievement
  const [state, formAction] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setOpen(false)
        if (!isEdit) setSelectedStudent("")
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [state?.success, isEdit])

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val && !isEdit) setSelectedStudent("")
    }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50">
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Catat Prestasi Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Data Prestasi" : "Input Prestasi Santri"}</DialogTitle>
        </DialogHeader>
        
        <form action={formAction} className="space-y-4 mt-2">
          {state?.error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {state.error}
            </div>
          )}

          <input type="hidden" name="student_id" value={selectedStudent} />

          <div className="space-y-2">
            <Label>Pilih Santri</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Ketik / Pilih Nama Santri --" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {students.map((s: StudentData) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - Kelas {s.class}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nama Perlombaan / Penghargaan</Label>
            <Input 
              name="nama_lomba" 
              defaultValue={initialData?.nama_lomba} 
              required 
              placeholder="Contoh: Olimpiade Sains Nasional (OSN) Matematika"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tingkat</Label>
              <Select name="tingkat" defaultValue={initialData?.tingkat}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tingkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sekolah">Sekolah / Antar Kelas</SelectItem>
                  <SelectItem value="Kabupaten/Kota">Kabupaten / Kota</SelectItem>
                  <SelectItem value="Provinsi">Provinsi</SelectItem>
                  <SelectItem value="Nasional">Nasional</SelectItem>
                  <SelectItem value="Internasional">Internasional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Peringkat / Predikat</Label>
              <Input 
                name="peringkat" 
                defaultValue={initialData?.peringkat} 
                required 
                placeholder="Contoh: 1 / Medali Emas"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Kegiatan</Label>
              <Input 
                type="date"
                name="tanggal" 
                defaultValue={initialData?.tanggal ? new Date(initialData.tanggal).toISOString().split('T')[0] : ''} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Penyelenggara</Label>
              <Input 
                name="penyelenggara" 
                defaultValue={initialData?.penyelenggara || ''} 
                placeholder="Contoh: Kemendikbud"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
             <SubmitButton>{isEdit ? "Simpan Perubahan" : "Simpan Data Prestasi"}</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}