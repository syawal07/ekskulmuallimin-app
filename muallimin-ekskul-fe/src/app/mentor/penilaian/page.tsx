import { cookies } from "next/headers"
import AssessmentClient from "@/components/mentor/assessment-client"

export const dynamic = "force-dynamic"

async function getMentorExculs() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return []
  try {
    const res = await fetch(`${apiUrl}/mentor/presensi-setup`, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' })
    if (!res.ok) return []
    const result = await res.json()
    const exculData = result.data?.excul || result.data?.exculs || result.data
    return Array.isArray(exculData) ? exculData : (exculData ? [exculData] : [])
  } catch (e) { return [] }
}

async function getAssessmentsData(exculId?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return { assessments: [], missing_students: [] }
  try {
    const url = exculId ? `${apiUrl}/mentor/assessments?excul_id=${exculId}` : `${apiUrl}/mentor/assessments`
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' })
    if (!res.ok) return { assessments: [], missing_students: [] }
    const result = await res.json()
    // Data sekarang berisi object dengan 2 array
    return result.data || { assessments: [], missing_students: [] }
  } catch (e) {
    return { assessments: [], missing_students: [] }
  }
}

export default async function MentorAssessmentPage() {
  const exculs = await getMentorExculs()
  const data = exculs.length > 0 ? await getAssessmentsData(exculs[0].id) : { assessments: [], missing_students: [] }

  return (
    <div className="space-y-2 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Penilaian Ekstrakurikuler</h1>
        <p className="text-slate-600">Sistem penilaian otomatis berbasis KKO (Kata Kerja Operasional) Level Bloom.</p>
      </div>
      
      {/* Kirim props missingStudents ke Client */}
      <AssessmentClient 
        exculs={exculs} 
        initialAssessments={data.assessments} 
        missingStudents={data.missing_students} 
      />
    </div>
  )
}