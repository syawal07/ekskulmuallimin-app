import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ExculModal from "@/components/admin/excul-modal"
import ExculActions from "@/components/admin/excul-actions"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { getToken } from "@/lib/session"

export const dynamic = "force-dynamic"

interface ExculItem {
  id: string;
  name: string;
  students_count: number;
}

async function getExculs(): Promise<ExculItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    
    if (!apiUrl || !token) return [];

    const res = await fetch(`${apiUrl}/admin/exculs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return [];

    const result = await res.json();
    return result.data as ExculItem[];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function AdminExculPage() {
  const exculs = await getExculs();

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
                        {ex.students_count} Anggota
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