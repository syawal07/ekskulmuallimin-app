'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, Upload, Loader2, FileSpreadsheet, CheckCircle2, Pencil, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { uploadAssessmentExcel, updateAssessmentScore, deleteAssessment } from "@/actions/assessmentAction"

interface ExculProps { id: string; name: string; }
interface AssessmentProps { id: string; score: number; predicate: string; bloom_level: string; description: string; student: { name: string; class: string; }; }
interface MissingStudentProps { id: string; name: string; class: string; }

export default function AssessmentClient({ 
  exculs, 
  initialAssessments,
  missingStudents 
}: { 
  exculs: ExculProps[], 
  initialAssessments: AssessmentProps[],
  missingStudents: MissingStudentProps[]
}) {
  const activeExcul = exculs.length > 0 ? exculs[0] : null
  const [uploading, setUploading] = useState(false)
  const [dataList, setDataList] = useState<AssessmentProps[]>(initialAssessments)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(dataList.length / itemsPerPage)
  const currentData = dataList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const [editingItem, setEditingItem] = useState<AssessmentProps | null>(null)
  const [editScore, setEditScore] = useState<number | string>("")
  const [saving, setSaving] = useState(false)

  useEffect(() => { setDataList(initialAssessments) }, [initialAssessments])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !activeExcul) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("excul_id", activeExcul.id)

    const res = await uploadAssessmentExcel(formData)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(res.message || "Nilai berhasil diproses!", { duration: 6000 })
    }
    
    setUploading(false)
    e.target.value = "" 
  }

  async function handleSaveEdit() {
    if (!editingItem || editScore === "" || Number(editScore) < 0 || Number(editScore) > 100) return toast.error("Masukkan nilai 0-100")
    setSaving(true)
    const res = await updateAssessmentScore(editingItem.id, Number(editScore))
    if (res?.error) toast.error(res.error)
    else {
      toast.success("Nilai berhasil diperbarui!")
      setDataList(prev => prev.map(item => item.id === editingItem.id ? { ...item, score: Number(editScore) } : item))
      setEditingItem(null)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus nilai siswa ini?")) return
    const res = await deleteAssessment(id)
    if (res?.error) toast.error(res.error)
    else {
      toast.success("Nilai dihapus")
      setDataList(prev => prev.filter(item => item.id !== id))
    }
  }

  if (!activeExcul) return <div className="bg-red-50 p-6 rounded-xl text-red-700">Akses Ditolak.</div>

  return (
    <div className="space-y-8 mt-6 pb-10">
      
      {/* KOTAK UPLOAD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8 max-w-3xl">
        <div className="space-y-3">
          <Label className="text-base font-semibold">1. Ekstrakurikuler yang Diampu</Label>
          <Input value={activeExcul.name} disabled className="bg-slate-50 font-bold text-slate-800" />
        </div>
        <div className="space-y-3">
          <Label className="text-base font-semibold">2. Unduh & Unggah Template</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-16 flex flex-col justify-center gap-1 border-emerald-200 text-emerald-700 bg-emerald-50" onClick={() => window.location.href = `/api/export-assessment-template?exculId=${activeExcul.id}`}>
              <span className="flex items-center gap-2 font-bold"><Download className="w-4 h-4"/> Unduh Template Excel</span>
            </Button>
            <div className="relative border-2 border-dashed border-slate-300 rounded-lg h-16 flex items-center justify-center hover:bg-emerald-50 transition-colors">
              <input type="file" accept=".xlsx, .xls" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleUpload} disabled={uploading}/>
              {uploading ? <span className="flex gap-2 text-emerald-600 font-bold text-sm"><Loader2 className="w-4 h-4 animate-spin"/> Memproses...</span> : <span className="flex gap-2 text-slate-600 font-bold text-sm"><Upload className="w-4 h-4"/> Unggah Excel (Isi Nilai)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* TABEL HASIL PENILAIAN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-full">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Rekapitulasi Nilai</h3>
          <span className="text-sm font-semibold text-slate-500">Total: {dataList.length} Siswa Dinilai</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4 text-center">Angka</th>
                <th className="px-6 py-4 text-center">Predikat</th>
                <th className="px-6 py-4">Level Bloom</th>
                {/* 👇 TAMBAHAN KOLOM DESKRIPSI 👇 */}
                <th className="px-6 py-4 w-1/3">Deskripsi Otomatis</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.student?.name}
                      <span className="block text-xs font-normal text-slate-500 mt-1">{item.student?.class}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600 text-base">{item.score}</td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded">{item.predicate}</span></td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.bloom_level}</td>
                    {/* 👇 TAMPILAN DATA DESKRIPSI 👇 */}
                    <td className="px-6 py-4 text-xs text-slate-500 leading-relaxed min-w-[250px]">{item.description}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-blue-600" onClick={() => { setEditingItem(item); setEditScore(item.score); }}><Pencil className="w-4 h-4"/></Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : ( <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada data.</td></tr> )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4"/> Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next <ChevronRight className="w-4 h-4"/></Button>
            </div>
          </div>
        )}
      </div>

      {/* DAFTAR SISWA BELUM DINILAI */}
      {missingStudents && missingStudents.length > 0 && (
        <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <div className="w-full">
              <h4 className="font-bold text-orange-800 text-base">Perhatian: {missingStudents.length} Siswa Belum Mendapatkan Nilai</h4>
              <p className="text-sm text-orange-700/80 mt-1 mb-4">Siswa-siswa di bawah ini terdaftar aktif di ekskul Anda, tetapi nilainya belum masuk ke sistem. Silakan unduh ulang template untuk mendapatkan nama mereka.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {missingStudents.map((siswa, idx) => (
                  <div key={idx} className="bg-white/80 border border-orange-100 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-sm truncate">{siswa.name}</span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{siswa.class}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT NILAI */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Revisi Nilai Siswa</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><p className="text-sm font-bold text-slate-800">{editingItem.student.name}</p><p className="text-xs text-slate-500">Kelas: {editingItem.student.class}</p></div>
              <div><Label>Nilai Angka Baru (0-100)</Label><Input type="number" min={0} max={100} value={editScore} onChange={(e) => setEditScore(e.target.value)} className="mt-1 font-bold text-lg" autoFocus/></div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingItem(null)}>Batal</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSaveEdit} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Simpan Perubahan"}</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}