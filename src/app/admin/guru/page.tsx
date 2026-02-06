import { prisma } from "@/lib/prisma"
// 1. IMPORT PRISMA (Untuk ambil tipe data)
import { Prisma } from "@prisma/client" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Search, ChevronLeft, ChevronRight, Users } from "lucide-react"
import Link from "next/link"
import SiswaActionButtons from "@/components/admin/siswa-action-buttons"
import FilterExculSiswa from "@/components/admin/filter-excul-siswa"
import SearchInput from "@/components/admin/search-input"
import ImportStudentButton from "@/components/admin/import-student-button"
export const dynamic = "force-dynamic"

export default async function AdminSiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; exculId?: string }>
}) {
  const params = await searchParams
  
  const page = Number(params.page) || 1
  const limit = 10 
  const skip = (page - 1) * limit
  const search = params.q || ""
  const filterExculId = params.exculId 

  const allExculs = await prisma.excul.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  // 2. PERBAIKAN: Gunakan tipe 'Prisma.StudentWhereInput' (Bukan 'any')
  const whereClause: Prisma.StudentWhereInput = {
    isActive: true,
    name: { contains: search, mode: "insensitive" }
  }

  if (filterExculId) {
    whereClause.exculId = filterExculId
  }

  const [students, totalCount] = await prisma.$transaction([
    prisma.student.findMany({
      where: whereClause,
      include: {
        excul: true 
      },
      orderBy: { name: "asc" },
      take: limit, 
      skip: skip   
    }),
    prisma.student.count({
      where: whereClause
    })
  ])

  const totalPages = Math.ceil(totalCount / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-slate-600">Daftar seluruh siswa peserta ekstrakurikuler.</p>
        </div>
        <div className="flex gap-2">
          {/* Tombol Import Excel (Akan kita buat sebentar lagi) */}
          <ImportStudentButton />
          
          <Link href="/admin/siswa/baru">
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-blue-500/20">
              <UserPlus className="w-4 h-4 mr-2" /> Tambah Siswa
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
       <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <CardTitle className="text-base font-bold text-slate-800">
              Total Siswa: <span className="text-primary">{totalCount}</span>
            </CardTitle>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              
              <FilterExculSiswa exculs={allExculs} />
              <SearchInput placeholder="Cari nama siswa..." />
              
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas / NIS</TableHead>
                <TableHead>Ekskul</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((siswa, index) => (
                  <TableRow key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-500 text-center">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900">{siswa.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                          {siswa.class}
                        </Badge>
                        {siswa.nis && <span className="text-xs text-slate-400">{siswa.nis}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-none">
                        {siswa.excul?.name || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <SiswaActionButtons studentId={siswa.id} studentName={siswa.name} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-10 h-10 text-slate-200" />
                      <p className="font-medium">Data siswa tidak ditemukan.</p>
                      <p className="text-xs text-slate-400">Coba ganti filter ekskul atau kata kunci pencarian.</p>
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
                href={`/admin/siswa?page=${page - 1}&q=${search}&exculId=${filterExculId || ''}`} 
                scroll={false} 
                className={!hasPrevPage ? "pointer-events-none" : ""}
              >
                <Button variant="outline" size="sm" disabled={!hasPrevPage} className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
              </Link>
              <Link 
                href={`/admin/siswa?page=${page + 1}&q=${search}&exculId=${filterExculId || ''}`} 
                scroll={false} 
                className={!hasNextPage ? "pointer-events-none" : ""}
              >
                <Button variant="outline" size="sm" disabled={!hasNextPage} className="gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}