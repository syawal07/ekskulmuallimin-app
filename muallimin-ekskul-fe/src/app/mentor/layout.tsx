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

  // 1. KUNCI PERBAIKAN: Izinkan akses jika role adalah MENTOR ATAU PEMBINA
  if (!token || (userRole !== "MENTOR" && userRole !== "PEMBINA")) {
    redirect("/login")
  }

  const name = cookieStore.get("user_name")?.value || "Pengajar"
  const username = cookieStore.get("user_username")?.value || "mentor"
  
  // 2. KUNCI PERBAIKAN: Tentukan boolean secara dinamis dari userRole yang terbaca
  const isMentorEkskul = userRole === "MENTOR"
  const isMentorPerkaderan = userRole === "PEMBINA"

  const user = {
    name: name,
    username: username,
    isMentorEkskul: isMentorEkskul,
    isMentorPerkaderan: isMentorPerkaderan
  }

  return (
    <MentorLayoutClient user={user}>
      {children}
    </MentorLayoutClient>
  )
}