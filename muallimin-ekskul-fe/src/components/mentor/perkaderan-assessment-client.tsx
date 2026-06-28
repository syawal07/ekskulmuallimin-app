'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Award, Users } from "lucide-react"
import { toast } from "sonner"
import { savePerkaderanAssessment } from "@/actions/perkaderanAction"

interface PerkaderanProps {
  id: number;
  nama_jenjang: string;
  kategori: string;
}

interface AssessmentProps {
  perkaderan_student_id: number;
  student_name: string;
  student_class: string;
  nilai: number | null;
  catatan: string;
}

export default function PerkaderanAssessmentClient({ 
  perkaderans, 
  selectedPerkaderanId,
  assessments 
}: { 
  perkaderans: PerkaderanProps[],
  selectedPerkaderanId: string | null,
  assessments: AssessmentProps[]
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  
  // State untuk menyimpan perubahan input sementara sebelum disave
  const [localData, setLocalData] = useState<Record<number, { nilai: string, catatan: string }>>({})

  const handlePerkaderanChange = (val: string) => {
    router.push(`/mentor/perkaderan/penilaian?perkaderan_id=${val}`)
  }

  const handleInputChange = (id: number, field: 'nilai' | 'catatan', value: string) => {
    setLocalData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { nilai: assessments.find(a => a.perkaderan_student_id === id)?.nilai?.toString() || "", catatan: assessments.find(a => a.perkaderan_student_id === id)?.catatan || "" }),
        [field]: value
      }
    }))
  }

  // PERBAIKAN: Mengganti tipe "any" menjadi tipe yang spesifik
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

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <Award className="w-5 h-5 text-blue-600" /> Pengaturan Penilaian
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
        <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Daftar Santri & Input Nilai
            </CardTitle>
          </CardHeader>
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
                      Belum ada santri yang terdaftar di jenjang perkaderan ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}