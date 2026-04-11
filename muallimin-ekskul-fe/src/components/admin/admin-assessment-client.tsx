'use client'

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, Loader2, ChevronLeft, ChevronRight, Users } from "lucide-react"
import { toast } from "sonner"
import { fetchAdminAssessments } from "@/actions/assessmentAction"

interface ExculProps { id: string; name: string; }
interface AssessmentProps { 
  id: string; 
  score: number; 
  predicate: string; 
  bloom_level: string; 
  description: string; 
  student: { name: string; class: string; }; 
  mentor: { name: string; } | null; 
}

export default function AdminAssessmentClient({ exculs }: { exculs: ExculProps[] }) {
  const [selectedExcul, setSelectedExcul] = useState<string>("")
  const [dataList, setDataList] = useState<AssessmentProps[]>([])
  const [loading, setLoading] = useState(false)

  // Setup Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(dataList.length / itemsPerPage)
  const currentData = dataList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  async function handleFilterChange(exculId: string) {
    setSelectedExcul(exculId)
    setLoading(true)
    
    const res = await fetchAdminAssessments(exculId)
    if (res?.error) {
      toast.error(res.error)
      setDataList([])
    } else if (res?.data) {
      setDataList(res.data)
      setCurrentPage(1) // Reset ke halaman 1 setiap kali ganti ekskul
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-6 mt-6 pb-12">
      {/* KOTAK FILTER & DOWNLOAD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/2 space-y-2">
          <label className="text-sm font-bold text-slate-700">Pilih Ekstrakurikuler</label>
          <Select value={selectedExcul} onValueChange={handleFilterChange}>
            <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Pilih cabang ekskul..." /></SelectTrigger>
            <SelectContent>
              {exculs.map(ex => <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto h-10"
          disabled={!selectedExcul || dataList.length === 0}
          onClick={() => window.location.href = `/api/export-admin-assessment?exculId=${selectedExcul}`}
        >
          <Download className="w-4 h-4 mr-2" /> Unduh Rapor (Excel)
        </Button>
      </div>

      {/* INFORMASI KOSONG */}
      {!selectedExcul && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-start gap-4 text-blue-800">
          <FileSpreadsheet className="w-8 h-8 shrink-0 text-blue-600" />
          <div>
            <h3 className="font-bold text-lg">Pusat Unduhan Rapor Penilaian</h3>
            <p className="text-sm mt-1 opacity-90 leading-relaxed">
              Pilih ekstrakurikuler di atas untuk melihat pratinjau nilai yang sudah diunggah oleh mentor. Anda dapat mengunduh seluruh data dalam format Excel resmi setelah memilih cabang ekstrakurikuler.
            </p>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Memuat data penilaian...</p>
        </div>
      )}

      {/* TABEL LIVE PREVIEW */}
      {selectedExcul && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Pratinjau Data Nilai
            </h3>
            <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              Total: {dataList.length} Siswa Dinilai
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                <tr>
                  {/* KELAS DAN NAMA DIGABUNG */}
                  <th className="px-6 py-4 font-bold">Nama Siswa</th>
                  <th className="px-6 py-4 font-bold">Mentor Penilai</th>
                  <th className="px-6 py-4 font-bold text-center">Angka</th>
                  <th className="px-6 py-4 font-bold text-center">Predikat</th>
                  <th className="px-6 py-4 font-bold">Level Bloom</th>
                  {/* KOLOM DESKRIPSI DIMUNCULKAN KEMBALI */}
                  <th className="px-6 py-4 font-bold w-1/3">Deskripsi Otomatis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.length > 0 ? (
                  currentData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {item.student?.name}
                        <span className="block text-xs font-normal text-slate-500 mt-1">{item.student?.class}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{item.mentor?.name || '-'}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600">{item.score}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded text-xs">{item.predicate}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{item.bloom_level}</td>
                      {/* ISI DATA DESKRIPSI */}
                      <td className="px-6 py-4 text-xs text-slate-500 leading-relaxed min-w-[250px]">{item.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Belum ada nilai yang diinput oleh mentor untuk ekstrakurikuler ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* NEXT / PREVIOUS (PAGINATION) */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-sm font-medium text-slate-500">Halaman {currentPage} dari {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="bg-white">
                  <ChevronLeft className="w-4 h-4 mr-1"/> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="bg-white">
                  Next <ChevronRight className="w-4 h-4 ml-1"/>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}