import { cookies } from "next/headers"
import GuruFormClient from "@/components/admin/guru-form-client"

async function getData(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  const [resGuru, resExculs, resPerkaderans] = await Promise.all([
    fetch(`${apiUrl}/admin/mentors/${id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${apiUrl}/admin/exculs`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${apiUrl}/admin/perkaderans`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  ])

  const guru = resGuru.ok ? await resGuru.json() : { data: null }
  const exculs = resExculs.ok ? await resExculs.json() : { data: [] }
  const perkaderans = resPerkaderans.ok ? await resPerkaderans.json() : { data: [] }

  return { guru: guru.data, exculs: exculs.data || [], perkaderans: perkaderans.data || [] }
}

export default async function GuruEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { guru, exculs, perkaderans } = await getData(resolvedParams.id)

  if (!guru) return <div className="p-8 text-center text-slate-500">Data guru tidak ditemukan</div>

  return (
    <div className="p-2">
      <GuruFormClient initialData={guru} exculs={exculs} perkaderans={perkaderans} />
    </div>
  )
}