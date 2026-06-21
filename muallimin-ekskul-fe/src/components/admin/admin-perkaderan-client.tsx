'use client'

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PerkaderanModal from "./perkaderan-modal"
import { deletePerkaderan } from "@/actions/perkaderanAction"

type PerkaderanData = {
  id: string | number
  nama_jenjang: string
  deskripsi: string | null
}

export default function AdminPerkaderanClient({ data }: { data: PerkaderanData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<PerkaderanData | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleOpenAdd = () => {
    setSelectedData(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: PerkaderanData) => {
    setSelectedData(item)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string | number, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus jenjang "${name}"?`)) {
      startTransition(async () => {
        const result = await deletePerkaderan(id)
        if (result?.error) {
          alert(result.error)
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Master Data Perkaderan</h2>
          <p className="text-slate-500 text-sm">Kelola jenjang dan tingkatan kaderisasi santri di sini.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-white shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jenjang
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Daftar Jenjang
          </CardTitle>
          <CardDescription>Menampilkan seluruh data tingkat perkaderan yang aktif di sistem.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[80px] text-center font-bold">No</TableHead>
                  <TableHead className="font-bold">Nama Jenjang</TableHead>
                  <TableHead className="font-bold">Deskripsi</TableHead>
                  <TableHead className="text-center font-bold w-[150px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                      Belum ada data jenjang perkaderan. Silakan tambahkan baru.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-bold text-slate-700">{item.nama_jenjang}</TableCell>
                      <TableCell className="text-slate-500">{item.deskripsi || <span className="italic text-slate-400">Tidak ada deskripsi</span>}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDelete(item.id, item.nama_jenjang)}
                            disabled={isPending}
                          >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <PerkaderanModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          data={selectedData} 
        />
      )}
    </div>
  )
}