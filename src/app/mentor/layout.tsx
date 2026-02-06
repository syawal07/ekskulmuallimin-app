import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
// Import komponen client baru
import MentorLayoutClient from "@/components/mentor/mentor-layout-client"

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. CEK KEAMANAN
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  const userRole = cookieStore.get("userRole")?.value

  // Hanya MENTOR boleh masuk
  if (!userId || userRole !== "MENTOR") {
    redirect("/login")
  }

  // 2. AMBIL DATA MENTOR
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true }
  })

  if (!user) redirect("/login")

  // 3. RENDER TAMPILAN (Client Component)
  return (
    <MentorLayoutClient user={user}>
      {children}
    </MentorLayoutClient>
  )
}