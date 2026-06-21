'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export type ActionState = {
  error?: string
  success?: boolean
} | null

export async function createAchievement(prevState: ActionState, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  const student_id = formData.get("student_id") as string
  const nama_lomba = formData.get("nama_lomba") as string
  const tingkat = formData.get("tingkat") as string
  const peringkat = formData.get("peringkat") as string
  const tanggal = formData.get("tanggal") as string
  const penyelenggara = formData.get("penyelenggara") as string

  if (!student_id || !nama_lomba || !tingkat || !peringkat || !tanggal) {
    return { error: "Data wajib belum lengkap." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/achievements`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ student_id, nama_lomba, tingkat, peringkat, tanggal, penyelenggara })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan data." }
    }

    revalidatePath("/admin/prestasi")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function updateAchievement(id: string | number, prevState: ActionState, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  const student_id = formData.get("student_id") as string
  const nama_lomba = formData.get("nama_lomba") as string
  const tingkat = formData.get("tingkat") as string
  const peringkat = formData.get("peringkat") as string
  const tanggal = formData.get("tanggal") as string
  const penyelenggara = formData.get("penyelenggara") as string

  if (!student_id || !nama_lomba || !tingkat || !peringkat || !tanggal) {
    return { error: "Data wajib belum lengkap." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/achievements/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ student_id, nama_lomba, tingkat, peringkat, tanggal, penyelenggara })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal memperbarui data." }
    }

    revalidatePath("/admin/prestasi")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function deleteAchievement(id: string | number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/achievements/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const result = await res.json();

    if (!res.ok) {
       return { error: result.message || "Gagal menghapus data." }
    }

    revalidatePath("/admin/prestasi")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}