import { cookies } from "next/headers"
import PerkaderanAttendanceClient from "@/components/mentor/perkaderan-attendance-client"

export const dynamic = "force-dynamic"

async function getPerkaderanSetupData(perkaderanId?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return null

  const url = perkaderanId 
    ? `${apiUrl}/mentor/perkaderan/presensi-setup?perkaderan_id=${perkaderanId}`
    : `${apiUrl}/mentor/perkaderan/presensi-setup`

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    })

    if (!res.ok) return null
    const result = await res.json()
    return result.data
  } catch (e) {
    return null
  }
}

export default async function PerkaderanPresensiPage({
  searchParams
}: {
  searchParams: Promise<{ perkaderan_id?: string }>
}) {
  const resolvedParams = await searchParams
  const data = await getPerkaderanSetupData(resolvedParams.perkaderan_id)

  if (!data) {
    return <div className="p-6 bg-red-50 text-red-600 rounded-xl">Gagal memuat data perkaderan.</div>
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Presensi Perkaderan</h1>
        <p className="text-slate-600">Catat kehadiran santri pada jenjang perkaderan yang Anda bina.</p>
      </div>

      <PerkaderanAttendanceClient 
        perkaderans={data.perkaderans}
        selectedPerkaderanId={data.selectedPerkaderanId}
        students={data.students}
      />
    </div>
  )
}