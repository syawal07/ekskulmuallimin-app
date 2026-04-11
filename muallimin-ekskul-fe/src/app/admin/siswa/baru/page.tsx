import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import CreateStudentForm from "@/components/admin/create-student-form"
import { getToken } from "@/lib/session"

export const dynamic = "force-dynamic"

interface Excul {
  id: string;
  name: string;
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

export default async function AddStudentPage() {
  const exculs = await getExculs()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/siswa">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Siswa Baru</h1>
          <p className="text-slate-500 text-sm">Daftarkan siswa ke dalam ekstrakurikuler.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-800">Form Data Siswa</CardTitle>
              <CardDescription>Pastikan nama dan pilihan ekskul benar.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <CreateStudentForm exculs={exculs} />
        </CardContent>
      </Card>
    </div>
  )
}