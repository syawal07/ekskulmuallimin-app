import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { logoutAction } from "@/actions/authAction"
// Import Client Component yang baru kita buat
import AdminLayoutClient from "@/components/admin/admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. CEK KEAMANAN
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  const userRole = cookieStore.get("userRole")?.value

  if (!userId || userRole !== "ADMIN") {
    redirect("/login")
  }

  // 2. AMBIL DATA ADMIN
  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true }
  })

  if (!admin) redirect("/login")

  // 3. RENDER UI CLIENT (Oper data admin dan fungsi logout)
  return (
    <AdminLayoutClient admin={admin}>
      {children}
    </AdminLayoutClient>
  )
}