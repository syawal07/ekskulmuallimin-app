'use client'

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, Loader2, ChevronLeft, ChevronRight, Users, Activity } from "lucide-react"
import { toast } from "sonner"
import { fetchAdminAssessments } from "@/actions/assessmentAction"

interface ExculProps { id: string; name: string; }
interface AssessmentProps { 
  id: string; 
  score: number; 
  predicate: string; 
  bloom_level: string; 
  description: string; 
  student: { name: string; class: string; } | null; 
  mentor: { name: string; } | null; 
}
interface StatusProps {
  excul_id: number;
  excul_name: string;
  mentor_name: string;
  total_siswa: number;
  total_dinilai: number;
  status: string;
  color: string;
}

export default function AdminAssessmentClient({ 
  exculs, 
  token,
  initialStatusData 
}: { 
  exculs: ExculProps[], 
  token: string,
  initialStatusData: StatusProps[]
}) {
  const [selectedExcul, setSelectedExcul] = useState<string>("")
  const [selectedKelas, setSelectedKelas] = useState<string>("")
  const [dataList, setDataList] = useState<AssessmentProps[]>([])
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const currentPage = 1
  const itemsPerPage = 100 
  
  const filteredDataList = selectedKelas 
    ? dataList.filter(item => item.student?.class === selectedKelas)
    : dataList;

  const totalPages = Math.ceil(filteredDataList.length / itemsPerPage)
  const [pageIndex, setPageIndex] = useState(1)
  const currentData = filteredDataList.slice((pageIndex - 1) * itemsPerPage, pageIndex * itemsPerPage)

  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

  async function handleFilterChange(exculId: string) {
    setSelectedExcul(exculId)
    setSelectedKelas("")
    setLoading(true)
    
    const res = await fetchAdminAssessments(exculId)
    if (res?.error) {
      toast.error(res.error)
      setDataList([])
      setAvailableClasses([])
    } else if (res?.data) {
      setDataList(res.data)
      setAvailableClasses(res.classes || [])
      setPageIndex(1) 
    }
    
    setLoading(false)
  }

  const handleDownloadReport = async () => {
    if (!selectedExcul || !token) {
      toast.error("Sesi tidak valid atau Ekskul belum dipilih.");
      return;
    }
    setDownloading(true);
    
    try {
      const activeExculData = exculs.find(e => e.id === selectedExcul);
      const namaEkskul = activeExculData ? activeExculData.name.replace(/ /g, '_') : 'Ekskul';
      const namaKelas = selectedKelas ? `_${selectedKelas.replace(/ /g, '')}` : '_Semua_Kelas';
      const fileName = `Laporan_Nilai_${namaEkskul}${namaKelas}.xlsx`;

      const queryParams = new URLSearchParams({ excul_id: selectedExcul });
      if (selectedKelas) queryParams.append('kelas', selectedKelas);

      const response = await fetch(`${backendUrl}/admin/assessments/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Gagal mengunduh rapor dari server.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengunduh rapor nilai.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6 mt-6 pb-12">
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800">Status Pengisian Nilai oleh Mentor</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
          {initialStatusData.length > 0 ? (
            initialStatusData.map((status) => (
              <div key={status.excul_id} className="p-4 rounded-lg border border-slate-100 bg-slate-50 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{status.excul_name}</h4>
                  <p className="text-xs text-slate-500 mt-1">Mentor: {status.mentor_name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    Progres: {status.total_dinilai} / {status.total_siswa}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                    status.color === 'success' ? 'bg-green-100 text-green-700' :
                    status.color === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {status.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-slate-500 text-sm">
              Belum ada data status ekstrakurikuler.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3 space-y-2">
          <label className="text-sm font-bold text-slate-700">Pilih Ekstrakurikuler</label>
          <Select value={selectedExcul} onValueChange={handleFilterChange}>
            <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Pilih cabang ekskul..." /></SelectTrigger>
            <SelectContent>
              {exculs.map(ex => <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-1/3 space-y-2">
          <label className="text-sm font-bold text-slate-700">Filter Kelas (Opsional)</label>
          <Select value={selectedKelas} onValueChange={(val) => { setSelectedKelas(val === "all" ? "" : val); setPageIndex(1); }} disabled={!selectedExcul || availableClasses.length === 0}>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder={availableClasses.length === 0 && selectedExcul ? "Tidak ada kelas" : "Semua Kelas"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {availableClasses.map(cls => <SelectItem key={cls} value={cls}>Kelas {cls}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full md:w-1/3 h-10"
          disabled={!selectedExcul || dataList.length === 0 || downloading}
          onClick={handleDownloadReport}
        >
          {downloading ? (
             <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyusun Rapor...</>
          ) : (
             <><Download className="w-4 h-4 mr-2" /> Unduh Rapor (Excel)</>
          )}
        </Button>
      </div>

      {!selectedExcul && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-start gap-4 text-blue-800">
          <FileSpreadsheet className="w-8 h-8 shrink-0 text-blue-600" />
          <div>
            <h3 className="font-bold text-lg">Pusat Unduhan Rapor Penilaian</h3>
            <p className="text-sm mt-1 opacity-90 leading-relaxed">
              Pilih ekstrakurikuler di atas untuk melihat pratinjau nilai yang sudah diunggah oleh mentor. Anda dapat memfilter berdasarkan kelas untuk mempermudah input ke sistem e-Rapor.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Memuat data penilaian...</p>
        </div>
      )}

      {selectedExcul && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Pratinjau Data Nilai {selectedKelas && `(Kelas ${selectedKelas})`}
            </h3>
            <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              Menampilkan {filteredDataList.length} Siswa
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Nama Siswa</th>
                  <th className="px-6 py-4 font-bold">Mentor Penilai</th>
                  <th className="px-6 py-4 font-bold text-center">Angka</th>
                  <th className="px-6 py-4 font-bold text-center">Predikat</th>
                  <th className="px-6 py-4 font-bold">Level Bloom</th>
                  <th className="px-6 py-4 font-bold w-1/3">Deskripsi Otomatis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.length > 0 ? (
                  currentData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {item.student?.name || '-'}
                        <span className="block text-xs font-normal text-slate-500 mt-1">{item.student?.class || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{item.mentor?.name || '-'}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600">{item.score}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded text-xs">{item.predicate}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{item.bloom_level}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 leading-relaxed min-w-[250px]">{item.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Belum ada nilai yang sesuai dengan filter saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-sm font-medium text-slate-500">Halaman {pageIndex} dari {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPageIndex(prev => Math.max(prev - 1, 1))} disabled={pageIndex === 1} className="bg-white">
                  <ChevronLeft className="w-4 h-4 mr-1"/> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPageIndex(prev => Math.min(prev + 1, totalPages))} disabled={pageIndex === totalPages} className="bg-white">
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