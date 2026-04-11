import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AttendanceForm from "@/components/mentor/attendance-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"

export const dynamic = "force-dynamic"

interface Excul {
  id: string;
  name: string;
}

async function getPresensiData(exculId?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

    if (!token || !apiUrl) return null;

    const url = exculId 
        ? `${apiUrl}/mentor/presensi-setup?excul_id=${exculId}`
        : `${apiUrl}/mentor/presensi-setup`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const result = await res.json();
    return result.data;
}

export default async function PresensiPage({
  searchParams,
}: {
  searchParams: Promise<{ exculId?: string }>
}) {
  const params = await searchParams
  const data = await getPresensiData(params.exculId);

  if (!data) redirect("/login")

  const { exculs, selectedExculId, selectedExculName, students, existing_attendance } = data;

  if (exculs.length === 0) {
    return <div className="p-8 text-center text-slate-500">Anda belum ditugaskan mengampu ekskul apapun.</div>
  }

  if (!selectedExculId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pilih Kelas Ekskul</h1>
          <p className="text-slate-600">Silakan pilih kelas yang ingin Anda presensi hari ini.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exculs.map((ex: Excul) => (
            <Card key={ex.id} className="hover:border-primary hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{ex.name}</h3>
                </div>
                <Link href={`/mentor/presensi?exculId=${ex.id}`} className="w-full">
                  <Button className="w-full" variant="outline">Pilih Kelas <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Input Presensi</h1>
          <p className="text-slate-600">Catat kehadiran santri secara real-time.</p>
        </div>
        {exculs.length > 1 && (
          <Link href="/mentor/presensi">
            <Button variant="outline" size="sm">Ganti Kelas</Button>
          </Link>
        )}
      </div>

      <AttendanceForm 
        students={students} 
        exculId={selectedExculId} 
        exculName={selectedExculName || ""}
        initialData={existing_attendance} 
      />
    </div>
  )
}