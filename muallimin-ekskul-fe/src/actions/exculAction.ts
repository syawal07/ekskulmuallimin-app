'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function createExcul(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Unauthorized" }

  const name = formData.get("name")
  const location = formData.get("location") || "INDUK"
  const kategori = formData.get("kategori") || "Pilihan"

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/exculs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, location, kategori }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.message || "Gagal membuat ekskul" }
    }

    revalidatePath('/admin/master/excul')
    return { success: true, data }
  } catch (error) {
    return { error: "Terjadi kesalahan server" }
  }
}

export async function updateExcul(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Unauthorized" }

  const name = formData.get("name")
  const location = formData.get("location") || "INDUK"
  const kategori = formData.get("kategori")

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/exculs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, location, kategori }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.message || "Gagal mengupdate ekskul" }
    }

    revalidatePath('/admin/master/excul')
    return { success: true, data }
  } catch (error) {
    return { error: "Terjadi kesalahan server" }
  }
}

export async function deleteExcul(id: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (role !== "ADMIN" || !token) return { error: "Unauthorized" }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/exculs/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok) {
       return { error: data.message || "Gagal menghapus. Pastikan tidak ada siswa di ekskul ini." }
    }

    revalidatePath("/admin/ekskul")
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: "Server Backend bermasalah" }
  }
}