import { cookies } from "next/headers"
import GuruFormClient from "@/components/admin/guru-form-client"

async function getOptions() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  const [resExculs, resPerkaderans] = await Promise.all([
    fetch(`${apiUrl}/admin/exculs`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${apiUrl}/admin/perkaderans`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  ])

  const exculs = resExculs.ok ? await resExculs.json() : { data: [] }
  const perkaderans = resPerkaderans.ok ? await resPerkaderans.json() : { data: [] }

  return { exculs: exculs.data || [], perkaderans: perkaderans.data || [] }
}

export default async function GuruBaruPage() {
  const { exculs, perkaderans } = await getOptions()

  return (
    <div className="p-2">
      <GuruFormClient exculs={exculs} perkaderans={perkaderans} />
    </div>
  )
}