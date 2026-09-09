import { cookies } from "next/headers"
import AdminPerkaderanMonitorClient from "@/components/admin/perkaderan-monitoring-client"

export const dynamic = "force-dynamic"

export default async function AdminPerkaderanMonitoringPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/perkaderan/monitoring`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  })

  const result = await res.json()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Monitoring Perkaderan</h1>
        <p className="text-sm text-slate-500">Pantau rekapitulasi presensi dan nilai akhir seluruh santri.</p>
      </div>
      
      <AdminPerkaderanMonitorClient 
        jenjangOptions={result.jenjang_options || []}
      />
    </div>
  )
}