import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import MentorLayoutClient from "@/components/mentor/mentor-layout-client"

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value

  if (!token || userRole !== "MENTOR") {
    redirect("/login")
  }

  const name = cookieStore.get("user_name")?.value || "Pengajar"
  const username = cookieStore.get("user_username")?.value || "mentor"

  const user = {
    name: name,
    username: username
  }

  return (
    <MentorLayoutClient user={user}>
      {children}
    </MentorLayoutClient>
  )
}