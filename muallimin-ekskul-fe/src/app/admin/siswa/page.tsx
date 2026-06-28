import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, ChevronLeft, ChevronRight, Users, CheckCircle2, XCircle } from "lucide-react"
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

interface StudentResponse {
  data: Student[];
  total: number;
  last_page: number;
  classes?: string[];
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

async function getStudents(page: number, q: string, exculId: string, kelas: string): Promise<StudentResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    if (!apiUrl || !token) return { data: [], total: 0, last_page: 1, classes: [] };

    const queryParams = new URLSearchParams({
      page: page.toString(),
      q: q || "",
      exculId: exculId || "",
      kelas: kelas || ""
    });

    const res = await fetch(`${apiUrl}/admin/students?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) return { data: [], total: 0, last_page: 1, classes: [] };
    const result = await res.json();
    
    return {
      data: result.data.data,
      total: result.data.total,
      last_page: result.data.last_page,
      classes: result.classes || []
    };
  } catch (e) {
    return { data: [], total: 0, last_page: 1, classes: [] };
  }
}

export default async function AdminSiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; exculId?: string; kelas?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 10
  const search = params.q || ""
  const filterExculId = params.exculId || ""
  const filterKelas = params.kelas || ""

  const allExculs = await getExculs()
  const studentData = await getStudents(page, search, filterExculId, filterKelas)

  const students = studentData.data
  const totalCount = studentData.total
  const totalPages = studentData.last_page
  const availableClasses = studentData.classes || []
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-slate-600">Daftar seluruh data induk kegiatan santri.</p>
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
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <CardTitle className="text-base font-bold text-slate-800">
              Total Siswa: <span className="text-primary">{totalCount}</span>
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
              <FilterExculSiswa exculs={allExculs} classes={availableClasses} />
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
                  return (
                    <TableRow key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
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
                  <TableCell colSpan={7} className="h-48 text-center text-slate-500">
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
        </CardContent>
      </Card>
    </div>
  )
}