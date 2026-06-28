import { cookies } from "next/headers"
import AdminPerkaderanMonitorClient from "@/components/admin/perkaderan-monitoring-client"

export const dynamic = "force-dynamic"

async function getMonitoringData(perkaderanId?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return null

  const url = perkaderanId 
    ? `${apiUrl}/admin/perkaderan/monitoring?perkaderan_id=${perkaderanId}`
    : `${apiUrl}/admin/perkaderan/monitoring`

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    })

    if (!res.ok) return null
    const result = await res.json()
    return result
  } catch (e) {
    return null
  }
}

export default async function AdminMonitoringPerkaderanPage({
  searchParams
}: {
  searchParams: Promise<{ perkaderan_id?: string }>
}) {
  const resolvedParams = await searchParams
  const result = await getMonitoringData(resolvedParams.perkaderan_id)

  if (!result || !result.success) {
    return <div className="p-6 bg-red-50 text-red-600 rounded-xl">Gagal memuat data monitoring.</div>
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Monitoring Perkaderan</h1>
        <p className="text-slate-600">Pantau rekapitulasi presensi dan nilai akhir seluruh santri.</p>
      </div>

      <AdminPerkaderanMonitorClient 
        data={result.data} 
        jenjangOptions={result.jenjang_options}
        selectedJenjang={resolvedParams.perkaderan_id || ""}
      />
    </div>
  )
}