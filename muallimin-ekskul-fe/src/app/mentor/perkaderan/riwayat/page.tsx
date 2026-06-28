import { cookies } from "next/headers"
import PerkaderanHistoryClient from "@/components/mentor/perkaderan-history-client"

export const dynamic = "force-dynamic"

async function getPerkaderanHistory(month: number, year: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return []

  try {
    const res = await fetch(`${apiUrl}/mentor/perkaderan/history?month=${month}&year=${year}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    })

    if (!res.ok) return []
    const result = await res.json()
    return result.data || []
  } catch (e) {
    return []
  }
}

export default async function PerkaderanRiwayatPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const resolvedParams = await searchParams
  
  const currentDate = new Date()
  const month = resolvedParams.month ? parseInt(resolvedParams.month) : currentDate.getMonth() + 1
  const year = resolvedParams.year ? parseInt(resolvedParams.year) : currentDate.getFullYear()

  const historyData = await getPerkaderanHistory(month, year)

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Riwayat Presensi</h1>
        <p className="text-slate-600">Pantau dan kelola riwayat absensi perkaderan yang telah Anda catat.</p>
      </div>

      <PerkaderanHistoryClient 
        initialData={historyData} 
        currentMonth={month} 
        currentYear={year} 
      />
    </div>
  )
}