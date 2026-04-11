import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, ChevronLeft, ChevronRight, Users } from "lucide-react"
import Link from "next/link"
import SiswaActionButtons from "@/components/admin/siswa-action-buttons"
import FilterExculSiswa from "@/components/admin/filter-excul-siswa"
import ImportStudentButton from "@/components/admin/import-student-button"
import { Suspense } from "react"
import SearchInput from "@/components/admin/search-input"
import { getToken } from "@/lib/session"

export const dynamic = "force-dynamic"

interface Excul {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  class: string;
  nis: string | null;
  excul: Excul | null;
}

interface StudentResponse {
  data: Student[];
  total: number;
  last_page: number;
}

async function getExculs(): Promise<Excul[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    if (!apiUrl || !token) return [];

    const res = await fetch(`${apiUrl}/admin/exculs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.data as Excul[];
  } catch (e) {
    return [];
  }
}

async function getStudents(page: number, q: string, exculId: string): Promise<StudentResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    if (!apiUrl || !token) return { data: [], total: 0, last_page: 1 };

    const queryParams = new URLSearchParams({
      page: page.toString(),
      q: q || "",
      exculId: exculId || ""
    });

    const res = await fetch(`${apiUrl}/admin/students?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) return { data: [], total: 0, last_page: 1 };
    const result = await res.json();
    return result.data as StudentResponse;
  } catch (e) {
    return { data: [], total: 0, last_page: 1 };
  }
}

export default async function AdminSiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; exculId?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 10
  const search = params.q || ""
  const filterExculId = params.exculId || ""

  const allExculs = await getExculs()
  const studentData = await getStudents(page, search, filterExculId)

  const students = studentData.data
  const totalCount = studentData.total
  const totalPages = studentData.last_page
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-slate-600">Daftar seluruh siswa peserta ekstrakurikuler.</p>
        </div>
        <div className="flex gap-2">
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
              <Suspense fallback={null}>
                <SearchInput placeholder="Cari nama siswa..." />
              </Suspense>
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
                href={`/admin/siswa?page=${page - 1}&q=${search}&exculId=${filterExculId}`}
                scroll={false}
                className={!hasPrevPage ? "pointer-events-none" : ""}
              >
                <Button variant="outline" size="sm" disabled={!hasPrevPage} className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
              </Link>
              <Link
                href={`/admin/siswa?page=${page + 1}&q=${search}&exculId=${filterExculId}`}
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