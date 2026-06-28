import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminPerkaderanClient from "@/components/admin/admin-perkaderan-client"
import PerkaderanModal from "@/components/admin/perkaderan-modal"

export const dynamic = "force-dynamic"

async function getPerkaderans() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return [];

  try {
    const res = await fetch(`${apiUrl}/admin/perkaderans`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      cache: 'no-store'
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export default async function AdminPerkaderanPage() {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value

  if (!token || userRole !== "ADMIN") {
    redirect("/login")
  }

  const data = await getPerkaderans()

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Data Perkaderan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola jenjang perkaderan, kategori, dan target kelas.</p>
        </div>
        <PerkaderanModal />
      </div>
      <AdminPerkaderanClient data={data} />
    </div>
  )
}