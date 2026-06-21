'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export type ActionState = {
  error?: string
  success?: boolean
} | null

export async function createPerkaderan(prevState: ActionState, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized: Hanya Admin yang boleh akses." }
  }

  const nama_jenjang = formData.get("nama_jenjang") as string
  const deskripsi = formData.get("deskripsi") as string

  if (!nama_jenjang) {
    return { error: "Nama Jenjang wajib diisi." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/perkaderans`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ nama_jenjang, deskripsi })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan data." }
    }

    revalidatePath("/admin/perkaderan")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function updatePerkaderan(id: string | number, prevState: ActionState, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  const nama_jenjang = formData.get("nama_jenjang") as string
  const deskripsi = formData.get("deskripsi") as string

  if (!nama_jenjang) {
    return { error: "Nama Jenjang wajib diisi." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/perkaderans/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ nama_jenjang, deskripsi })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal memperbarui data." }
    }

    revalidatePath("/admin/perkaderan")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function deletePerkaderan(id: string | number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/perkaderans/${id}`, {
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

    revalidatePath("/admin/perkaderan")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}