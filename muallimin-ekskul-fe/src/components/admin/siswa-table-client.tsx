'use client'

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import SiswaActionButtons from "@/components/admin/siswa-action-buttons"
import { bulkDeleteStudents } from "@/actions/studentAction"

interface Excul {
  id: string;
  name: string;
}

interface Perkaderan {
  id: number;
  nama_jenjang: string;
}

interface PerkaderanStudent {
  id: number;
  status: string;
  jabatan: string;
  perkaderan?: Perkaderan;
}

interface Student {
  id: string;
  name: string;
  class: string;
  nis: string | null;
  nisn: string | null;
  angkatan: string | null;
  jabatan_organisasi: string | null;
  is_active: boolean;
  exculs?: Excul[];
  perkaderans?: PerkaderanStudent[];
}

interface SiswaTableClientProps {
  students: Student[];
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  filterExculId: string;
  filterKelas: string;
}

export default function SiswaTableClient({
  students,
  page,
  limit,
  totalPages,
  search,
  filterExculId,
  filterKelas
}: SiswaTableClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Yakin ingin menghapus permanen ${selectedIds.length} data siswa terpilih beserta riwayatnya?`)) return

    setIsDeleting(true)
    const res = await bulkDeleteStudents(selectedIds)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(`${selectedIds.length} data siswa berhasil dihapus.`)
      setSelectedIds([])
    }
    setIsDeleting(false)
  }

  return (
    <div className="w-full">
      {selectedIds.length > 0 && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-red-700">
            {selectedIds.length} siswa dipilih
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete} 
            disabled={isDeleting}
            className="shadow-md shadow-red-500/20"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Hapus Terpilih
          </Button>
        </div>
      )}

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[40px] text-center">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-blue-600"
                checked={students.length > 0 && selectedIds.length === students.length}
                onChange={handleSelectAll}
                disabled={students.length === 0 || isDeleting}
              />
            </TableHead>
            <TableHead className="w-[50px] text-center">No</TableHead>
            <TableHead>Nama Siswa</TableHead>
            <TableHead>Kelas & NIS</TableHead>
            <TableHead>Status Akademik</TableHead>
            <TableHead className="min-w-[200px]">Perkaderan & Jabatan</TableHead>
            <TableHead>Ekskul Aktif</TableHead>
            <TableHead className="text-right pr-6">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((siswa, index) => {
              const isSelected = selectedIds.includes(siswa.id)
              
              return (
                <TableRow key={siswa.id} className={isSelected ? 'bg-blue-50/50 transition-colors' : 'hover:bg-slate-50/50 transition-colors'}>
                  <TableCell className="text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-blue-600"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(e, siswa.id)}
                      disabled={isDeleting}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-500 text-center">
                    {(page - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900">{siswa.name}</div>
                    {siswa.angkatan && (
                      <div className="text-[11px] text-slate-400 mt-0.5">Angkatan {siswa.angkatan}</div>
                    )}
                    {siswa.jabatan_organisasi && (
                      <div className="text-[11px] text-primary font-medium mt-0.5">Org: {siswa.jabatan_organisasi}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                          {siswa.class}
                        </Badge>
                        {siswa.nis && <span className="text-xs text-slate-500">NIS: {siswa.nis}</span>}
                      </div>
                      {siswa.nisn && (
                        <span className="text-[11px] text-slate-400 font-medium">NISN: {siswa.nisn}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {siswa.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Non-Aktif / Lulus
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {siswa.perkaderans && siswa.perkaderans.length > 0 ? (
                        siswa.perkaderans.map((p, i) => (
                          <div key={i} className="flex flex-col items-start p-1.5 bg-slate-50 border border-slate-100 rounded-md">
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none font-bold text-[10px] px-1.5 py-0">
                              {p.perkaderan?.nama_jenjang || "Tidak Diketahui"}
                            </Badge>
                            <span className="text-[10px] text-slate-500 mt-1">
                              {p.jabatan || 'Peserta'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum Diplot</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {siswa.exculs && siswa.exculs.length > 0 ? (
                        siswa.exculs.map((ex) => (
                          <Badge key={ex.id} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-none text-[10px]">
                            {ex.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum Mengikuti</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <SiswaActionButtons studentId={siswa.id} studentName={siswa.name} />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-48 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Users className="w-10 h-10 text-slate-200" />
                  <p className="font-medium">Data siswa tidak ditemukan.</p>
                  <p className="text-xs text-slate-400">Coba ganti filter kelas, ekskul atau kata kunci pencarian.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 bg-slate-50/30">
        <div className="text-sm text-slate-500">
          Halaman <b>{page}</b> dari <b>{totalPages || 1}</b>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/siswa?page=${page - 1}&q=${search}&exculId=${filterExculId}&kelas=${filterKelas}`}
            scroll={false}
            className={!hasPrevPage ? "pointer-events-none" : ""}
          >
            <Button variant="outline" size="sm" disabled={!hasPrevPage} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
          </Link>
          <Link
            href={`/admin/siswa?page=${page + 1}&q=${search}&exculId=${filterExculId}&kelas=${filterKelas}`}
            scroll={false}
            className={!hasNextPage ? "pointer-events-none" : ""}
          >
            <Button variant="outline" size="sm" disabled={!hasNextPage} className="gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}