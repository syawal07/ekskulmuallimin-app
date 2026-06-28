import { cookies } from "next/headers"
import AdminAssessmentClient from "@/components/admin/admin-assessment-client"

export const dynamic = "force-dynamic"

async function getExculs() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return []
  try {
    const res = await fetch(`${apiUrl}/admin/exculs`, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' })
    if (!res.ok) return []
    const result = await res.json()
    return result.data || []
  } catch (e) { return [] }
}

async function getStatusData(token: string, apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/admin/assessments/status`, { 
      headers: { 'Authorization': `Bearer ${token}` }, 
      cache: 'no-store' 
    })
    if (!res.ok) return []
    const result = await res.json()
    return result.data || []
  } catch (e) { 
    return [] 
  }
}

export default async function AdminAssessmentPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value || ""
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL || ""
  
  const exculs = await getExculs()
  const statusData = await getStatusData(token, apiUrl)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rekapitulasi Penilaian</h1>
        <p className="text-slate-600">Pantau progres pengisian dan unduh rapor akhir ekstrakurikuler.</p>
      </div>
      
      <AdminAssessmentClient 
        exculs={exculs} 
        token={token} 
        initialStatusData={statusData} 
      />
    </div>
  )
}