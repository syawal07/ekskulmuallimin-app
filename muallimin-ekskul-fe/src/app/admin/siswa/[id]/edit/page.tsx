import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserCog } from "lucide-react"
import Link from "next/link"
import EditStudentForm from "@/components/admin/edit-student-form" 
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

interface Student {
  id: string;
  name: string;
  class: string;
  nis: string | null;
  nisn: string | null;
  jenis_kelamin: string | null;
  angkatan: string | null;
  jabatan_organisasi: string | null;
  exculId: string;
  perkaderan_id?: number | null;
}

async function getEditRequiredData(id: string): Promise<{ student: Student | null, exculs: Excul[], perkaderans: Perkaderan[] }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    if (!apiUrl || !token) return { student: null, exculs: [], perkaderans: [] };

    const [studentRes, exculRes, perkaderanRes] = await Promise.all([
      fetch(`${apiUrl}/admin/students/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        cache: 'no-store'
      }),
      fetch(`${apiUrl}/admin/exculs`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        cache: 'no-store'
      }),
      fetch(`${apiUrl}/admin/perkaderans`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        cache: 'no-store'
      })
    ]);

    const studentJson = studentRes.ok ? await studentRes.json() : null;
    const studentData = studentJson ? studentJson.data : null;
    const exculData = exculRes.ok ? (await exculRes.json()).data : [];
    const perkaderanData = perkaderanRes.ok ? (await perkaderanRes.json()).data : [];

    return { 
      student: studentData, 
      exculs: exculData, 
      perkaderans: perkaderanData 
    };
  } catch (e) {
    return { student: null, exculs: [], perkaderans: [] };
  }
}

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { student, exculs, perkaderans } = await getEditRequiredData(id)

  if (!student) return notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/siswa">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Data Siswa</h1>
          <p className="text-slate-500 text-sm">Perbarui informasi data induk, ekskul, dan perkaderan siswa.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-800">Form Edit Data Induk Terintegrasi</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <EditStudentForm student={student} exculs={exculs} perkaderans={perkaderans} />
        </CardContent>
      </Card>
    </div>
  )
}