import { cookies } from "next/headers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminAttendanceClient from "@/components/admin/admin-attendance-client"
import AdminAttendanceSessionsClient from "@/components/admin/admin-attendance-sessions-client"
import AdminMentorRecapClient from "@/components/admin/admin-mentor-recap-client"

export const dynamic = "force-dynamic"

async function getExculs() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) return []

    const res = await fetch(`${apiUrl}/admin/exculs`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      cache: "no-store"
    })

    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch (error) {
    return []
  }
}

export default async function AdminPresensiPage() {
  const exculs = await getExculs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Monitoring Presensi</h1>
        <p className="text-slate-500 text-sm mt-1">Pusat pemantauan aktivitas kehadiran dan rekapitulasi siswa.</p>
      </div>

      <Tabs defaultValue="sesi" className="w-full">
        <TabsList className="bg-slate-100/80 p-1 mb-2 flex flex-wrap h-auto">
          <TabsTrigger value="sesi">Log Sesi Mentor</TabsTrigger>
          <TabsTrigger value="rekap">Rekapitulasi Total</TabsTrigger>
          <TabsTrigger value="mentor-rekap">Kehadiran Pelatih</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sesi" className="mt-0">
          <AdminAttendanceSessionsClient exculs={exculs} />
        </TabsContent>
        
        <TabsContent value="rekap" className="mt-0">
          <AdminAttendanceClient exculs={exculs} />
        </TabsContent>

        <TabsContent value="mentor-rekap" className="mt-0">
          <AdminMentorRecapClient />
        </TabsContent>
      </Tabs>
    </div>
  )
}