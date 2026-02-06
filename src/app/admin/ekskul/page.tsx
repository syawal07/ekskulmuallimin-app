import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ExculModal from "@/components/admin/excul-modal"
import ExculActions from "@/components/admin/excul-actions"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminExculPage() {
  const exculs = await prisma.excul.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { students: true }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Ekstrakurikuler</h1>
          <p className="text-slate-600">Manajemen daftar ekstrakurikuler sekolah.</p>
        </div>
        <ExculModal mode="create" />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Total Ekskul: <span className="text-primary">{exculs.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Nama Ekskul</TableHead>
                <TableHead className="text-center">Jumlah Siswa</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exculs.length > 0 ? (
                exculs.map((ex, index) => (
                  <TableRow key={ex.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-medium text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {ex.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {ex._count.students} Anggota
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <ExculActions id={ex.id} name={ex.name} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    Belum ada data ekstrakurikuler.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}