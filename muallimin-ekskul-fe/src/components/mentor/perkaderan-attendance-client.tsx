'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, Loader2, CalendarCheck, Users } from "lucide-react"
import { toast } from "sonner"
import { submitPerkaderanAttendance } from "@/actions/perkaderanAction"

// Definisikan tipe data agar ESLint tidak error "any"
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

  const handlePerkaderanChange = (val: string) => {
    router.push(`/mentor/perkaderan/presensi?perkaderan_id=${val}`)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await submitPerkaderanAttendance(formData)
    
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
          <input type="hidden" name="perkaderanId" value={selectedPerkaderanId} />
          
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Daftar Santri
              </CardTitle>
              <Input 
                type="date" 
                name="date" 
                defaultValue={new Date().toISOString().substring(0, 10)} 
                className="w-40 bg-slate-50"
                required
              />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {students.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Belum ada santri yang terdaftar di jenjang perkaderan ini.
                  </div>
                ) : (
                  students.map((ps, index) => (
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
                          defaultValue="HADIR" 
                          name={`status-${ps.id}`} 
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
                          name={`notes-${ps.id}`} 
                          placeholder="Catatan..." 
                          className="bg-white border-slate-200"
                        />
                      </div>
                    </div>
                  ))
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