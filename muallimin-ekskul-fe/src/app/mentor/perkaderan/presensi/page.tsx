import { cookies } from "next/headers"
import PerkaderanAttendanceClient from "@/components/mentor/perkaderan-attendance-client"

export const dynamic = "force-dynamic"

export default async function MentorPerkaderanPresensiPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/mentor/perkaderan/presensi-setup`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  })

  const result = await res.json()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Presensi Perkaderan</h1>
        <p className="text-sm text-slate-500">Catat kehadiran santri pada jenjang perkaderan yang Anda bina.</p>
      </div>
      
      <PerkaderanAttendanceClient 
        perkaderans={result.data?.perkaderans || []} 
      />
    </div>
  )
}