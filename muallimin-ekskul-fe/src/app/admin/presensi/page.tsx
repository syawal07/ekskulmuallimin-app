import { cookies } from "next/headers"
import AdminAttendanceSessionsClient from "@/components/admin/admin-attendance-sessions-client"
import AdminAttendanceClient from "@/components/admin/admin-attendance-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

interface Excul {
  id: string;
  name: string;
}

async function getExculs(): Promise<Excul[]> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return []

  try {
    const exculRes = await fetch(`${apiUrl}/admin/exculs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    })
    const response = await exculRes.json()
    return exculRes.ok ? response.data : []
  } catch (error) {
    return []
  }
}

export default async function AdminPresensiPage() {
  const exculs = await getExculs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Monitoring Presensi</h1>
        <p className="text-slate-600">Pusat pemantauan aktivitas kehadiran dan rekapitulasi siswa.</p>
      </div>

      <Tabs defaultValue="log-sesi" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100 p-1">
          <TabsTrigger value="log-sesi" className="gap-2">
            <CalendarDays className="w-4 h-4" /> Log Sesi Mentor
          </TabsTrigger>
          <TabsTrigger value="rekap-total" className="gap-2">
            <FileText className="w-4 h-4" /> Rekapitulasi Total
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log-sesi">
          <AdminAttendanceSessionsClient exculs={exculs} />
        </TabsContent>

        <TabsContent value="rekap-total">
          <AdminAttendanceClient exculs={exculs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}