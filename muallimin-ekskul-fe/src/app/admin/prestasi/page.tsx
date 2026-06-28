import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Medal, Calendar, Search } from "lucide-react"
import PrestasiModal from "@/components/admin/prestasi-modal"
import PrestasiActionButtons from "@/components/admin/prestasi-action-buttons"
import { getToken } from "@/lib/session"

export const dynamic = "force-dynamic"

interface Achievement {
  id: number;
  student_id: string;
  nama_lomba: string;
  tingkat: string;
  peringkat: string;
  tanggal: string;
  penyelenggara: string | null;
  student: {
    name: string;
    class: string;
  };
}

async function getAchievements(): Promise<Achievement[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    if (!apiUrl || !token) return [];

    const res = await fetch(`${apiUrl}/admin/achievements`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) return [];
    const result = await res.json();
    return result.data as Achievement[];
  } catch (e) {
    return [];
  }
}

async function getStudents() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    const res = await fetch(`${apiUrl}/admin/students?limit=1000`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.data.data || [];
  } catch (e) {
    return [];
  }
}

export default async function AdminPrestasiPage() {
  const achievements = await getAchievements()
  const students = await getStudents()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Prestasi</h1>
          <p className="text-slate-600">Pencatatan riwayat lomba dan penghargaan santri.</p>
        </div>
        <PrestasiModal students={students} />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-500" />
              Total Prestasi: <span className="text-amber-600">{achievements.length}</span>
            </CardTitle>
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari prestasi..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all bg-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Prestasi & Tingkat</TableHead>
                <TableHead>Penyelenggara</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.length > 0 ? (
                achievements.map((ach, index) => (
                  <TableRow key={ach.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-medium text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900">{ach.student?.name}</div>
                      <div className="text-xs text-slate-500">Kelas {ach.student?.class}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-800 mb-1">{ach.nama_lomba}</div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          Juara {ach.peringkat}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">
                          Tingkat {ach.tingkat}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {ach.penyelenggara || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(ach.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                         <PrestasiModal initialData={ach} students={students} />
                         <PrestasiActionButtons id={ach.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Belum ada data prestasi yang dicatat.
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