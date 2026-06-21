'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, Pencil, Settings2 } from "lucide-react"
import { deleteStudent } from "@/actions/studentAction"
import { toast } from "sonner"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

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
  perkaderan?: Perkaderan;
}

interface StudentRecord {
  id: string;
  name: string;
  class: string;
  nis: string | null;
  jabatan_organisasi?: string | null;
  excul: Excul | null;
  perkaderan_students?: PerkaderanStudent[];
}

export default function SiswaActionButtons({ 
  studentName,
  records
}: { 
  studentName: string
  records: StudentRecord[]
}) {
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    const res = await deleteStudent(deleteId)
    setLoading(false)
    setDeleteId(null)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Data siswa berhasil dihapus")
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 font-bold shadow-sm"
          >
            <Settings2 className="w-4 h-4" /> Kelola Data
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Kelola Data Terintegrasi</DialogTitle>
            <DialogDescription>
              Daftar partisipasi kegiatan atas nama <b className="text-slate-800">{studentName}</b>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 border rounded-xl overflow-hidden bg-slate-50/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700">Ekstrakurikuler</th>
                    <th className="px-4 py-3 font-bold text-slate-700">Jabatan</th>
                    <th className="px-4 py-3 font-bold text-slate-700">Perkaderan</th>
                    <th className="px-4 py-3 font-bold text-slate-700 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record) => {
                    const activePerkaderan = record.perkaderan_students?.find(p => p.status === 'Aktif');
                    
                    return (
                      <tr key={record.id} className="hover:bg-white transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {record.excul?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {record.jabatan_organisasi || <span className="text-slate-400 italic">Santri</span>}
                        </td>
                        <td className="px-4 py-3">
                          {activePerkaderan?.perkaderan ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none font-bold">
                              {activePerkaderan.perkaderan.nama_jenjang}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Belum Diplot</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/siswa/${record.id}/edit`}>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50" 
                                disabled={loading}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => setDeleteId(record.id)}
                              className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kepesertaan Siswa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data parsial siswa pada baris ini beserta <b>seluruh riwayat presensi dan nilainya</b>. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}