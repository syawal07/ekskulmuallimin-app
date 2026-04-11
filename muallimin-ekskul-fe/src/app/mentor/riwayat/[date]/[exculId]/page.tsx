import { cookies } from "next/headers"
import AttendanceForm from "@/components/mentor/attendance-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

async function getEditPresensiData(date: string, exculId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

    if (!token || !apiUrl) return null;

    const res = await fetch(`${apiUrl}/mentor/presensi-edit?date=${date}&excul_id=${exculId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const result = await res.json();
    return result.data;
}

export default async function EditAttendancePage({
  params,
}: {
  params: Promise<{ date: string; exculId: string }>
}) {
  const { date, exculId } = await params
  
  const data = await getEditPresensiData(date, exculId);

  if (!data) return <div>Data tidak ditemukan</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mentor/riwayat">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Presensi</h1>
          <p className="text-slate-600">Perbaiki data kehadiran jika ada kesalahan.</p>
        </div>
      </div>

      <AttendanceForm 
        students={data.students} 
        exculId={exculId} 
        exculName={data.excul_name}
        initialDate={date}          
        initialData={data.existing_attendance} 
      />
    </div>
  )
}