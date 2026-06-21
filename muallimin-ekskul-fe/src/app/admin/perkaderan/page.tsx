import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminPerkaderanClient from "@/components/admin/admin-perkaderan-client"

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

  const perkaderanData = await getPerkaderans()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPerkaderanClient data={perkaderanData} />
    </div>
  )
}