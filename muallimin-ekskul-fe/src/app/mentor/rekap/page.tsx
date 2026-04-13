import { cookies } from "next/headers"
import MentorAttendanceRecapClient from "@/components/mentor/mentor-attendance-recap-client"

export const dynamic = "force-dynamic"

interface Excul {
  id: string;
  name: string;
}

async function getMentorExculs(): Promise<Excul[]> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return []

  try {
    const res = await fetch(`${apiUrl}/mentor/presensi-setup`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    })
    const response = await res.json()
    return res.ok ? response.data.exculs : []
  } catch (error) {
    return []
  }
}

export default async function MentorRekapPage() {
  const exculs = await getMentorExculs()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rekapitulasi Presensi</h1>
        <p className="text-slate-600">Pantau akumulasi kehadiran siswa pada ekstrakurikuler yang Anda ampu.</p>
      </div>

      <MentorAttendanceRecapClient exculs={exculs} />
    </div>
  )
}