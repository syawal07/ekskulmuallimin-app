'use server'

import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

type AuthState = {
  error?: string
} | null

// ==========================================
// 1. LOGIN ACTION
// ==========================================
export async function loginAction(prevState: AuthState, formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." }
  }

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user || !(await compare(password, user.password))) {
    return { error: "Username atau password salah!" }
  }

  const cookieStore = await cookies()
  cookieStore.set("userId", user.id, { httpOnly: true, maxAge: 86400 })
  cookieStore.set("userRole", user.role, { httpOnly: true, maxAge: 86400 })

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard")
  } else {
    redirect("/mentor/dashboard")
  }
}

// ==========================================
// 2. LOGOUT ACTION
// ==========================================
export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  cookieStore.delete("userRole")
  redirect("/login")
}

// ==========================================
// 3. CREATE MENTOR (KHUSUS ADMIN)
// ==========================================
export async function createMentorUser(formData: FormData) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("userRole")?.value
  
  if (userRole !== "ADMIN") {
    return { error: "Unauthorized: Hanya Admin yang boleh menambah guru." }
  }

  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!name || !username || !password) {
    return { error: "Semua kolom wajib diisi." }
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." }
  }

  if (password !== confirmPassword) {
    return { error: "Password dan Konfirmasi tidak cocok." }
  }

  const existingUser = await prisma.user.findUnique({
    where: { username }
  })

  if (existingUser) {
    return { error: "Username sudah dipakai. Cari yang lain." }
  }

  try {
    const hashedPassword = await hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: "MENTOR"
      }
    })

    revalidatePath("/admin/guru")
    
  } catch (err) { // Ubah 'error' jadi 'err' dan log
    console.error("Gagal buat user:", err) // Pakai variabel err agar tidak unused
    return { error: "Terjadi kesalahan sistem saat menyimpan data." }
  }

  redirect("/admin/guru?success=created")
}

// ==========================================
// 4. HAPUS MENTOR
// ==========================================
export async function deleteMentor(userId: string) {
  const cookieStore = await cookies()
  if (cookieStore.get("userRole")?.value !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.user.delete({
      where: { id: userId }
    })
    
    revalidatePath("/admin/guru")
    return { success: true }
  } catch (err) { // Ubah nama variabel agar tidak ambigu
    console.error("Gagal hapus mentor:", err) // Log errornya
    return { error: "Gagal menghapus user (mungkin masih ada data terkait)." }
  }
}

// ==========================================
// 5. RESET PASSWORD MENTOR
// ==========================================
export async function resetMentorPassword(userId: string) {
  const cookieStore = await cookies()
  if (cookieStore.get("userRole")?.value !== "ADMIN") return { error: "Unauthorized" }

  const defaultPassword = "password123"

  try {
    const hashedPassword = await hash(defaultPassword, 10)
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    revalidatePath("/admin/guru")
    return { success: true, newPassword: defaultPassword }
  } catch (err) {
    console.error("Gagal reset password:", err) // Log errornya
    return { error: "Gagal mereset password." }
  }
}