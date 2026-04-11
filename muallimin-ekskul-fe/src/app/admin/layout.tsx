import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import AdminLayoutClient from "@/components/admin/admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. CEK KEAMANAN
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value

  if (!token || userRole !== "ADMIN") {
    redirect("/login")
  }

  // 2. AMBIL DATA ADMIN (Dari cookies hasil login)
  const name = cookieStore.get("user_name")?.value || "Administrator";
  const username = cookieStore.get("user_username")?.value || "admin";
  
  const admin = {
    name: name,
    username: username
  }

  // 3. RENDER UI CLIENT (Oper data admin)
  return (
    <AdminLayoutClient admin={admin}>
      {children}
    </AdminLayoutClient>
  )
}