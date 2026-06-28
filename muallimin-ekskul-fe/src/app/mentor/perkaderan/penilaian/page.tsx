import { cookies } from "next/headers"
import PerkaderanAssessmentClient from "@/components/mentor/perkaderan-assessment-client"

export const dynamic = "force-dynamic"

async function getPerkaderanAssessments(perkaderanId?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return null

  const url = perkaderanId 
    ? `${apiUrl}/mentor/perkaderan/assessments?perkaderan_id=${perkaderanId}`
    : `${apiUrl}/mentor/perkaderan/assessments`

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

export default async function PerkaderanPenilaianPage({
  searchParams
}: {
  searchParams: Promise<{ perkaderan_id?: string }>
}) {
  const resolvedParams = await searchParams
  const data = await getPerkaderanAssessments(resolvedParams.perkaderan_id)

  if (!data) {
    return <div className="p-6 bg-red-50 text-red-600 rounded-xl">Gagal memuat data penilaian perkaderan.</div>
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Penilaian Perkaderan</h1>
        <p className="text-slate-600">Berikan nilai akhir dan catatan perkembangan untuk santri binaan Anda.</p>
      </div>

      <PerkaderanAssessmentClient 
        perkaderans={data.perkaderans || []}
        selectedPerkaderanId={resolvedParams.perkaderan_id || null}
        assessments={data.assessments || []}
      />
    </div>
  )
}