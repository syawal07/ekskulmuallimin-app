import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import Link from "next/link"
import FilterExculSiswa from "@/components/admin/filter-excul-siswa"
import ImportStudentButton from "@/components/admin/import-student-button"
import { Suspense } from "react"
import SearchInput from "@/components/admin/search-input"
import { getToken } from "@/lib/session"
import SiswaTableClient from "@/components/admin/siswa-table-client"
import WipeStudentButton from "@/components/admin/wipe-student-button"

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-slate-600">Daftar seluruh data induk kegiatan santri.</p>
        </div>
      <div className="flex flex-wrap gap-2 justify-end">
          <WipeStudentButton />
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
          <SiswaTableClient 
            students={students} 
            page={page} 
            limit={limit} 
            totalPages={totalPages} 
            search={search}
            filterExculId={filterExculId}
            filterKelas={filterKelas}
          />
        </CardContent>
      </Card>
    </div>
  )
}