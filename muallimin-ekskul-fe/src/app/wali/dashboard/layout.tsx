import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import WaliLayoutClient from "@/components/wali/wali-layout-client"

export default async function WaliLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value

  if (!token || userRole !== "wali") {
    redirect("/login")
  }

  const name = cookieStore.get("user_name")?.value || "Wali Santri"
  const username = cookieStore.get("user_username")?.value || "wali"

  const user = {
    name: name,
    username: username
  }

  return (
    <WaliLayoutClient user={user}>
      {children}
    </WaliLayoutClient>
  )
}