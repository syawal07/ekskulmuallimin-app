'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function createExcul(formData: FormData) {
  const cookieStore = await cookies()
  const role = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (role !== "ADMIN" || !token) return { error: "Unauthorized" }

  const name = formData.get("name") as string

  if (!name) return { error: "Nama ekskul wajib diisi" }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/exculs`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name: name, location: "INDUK" })
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Gagal membuat ekskul" }
    }

    revalidatePath("/admin/ekskul")
    return { success: true }
  } catch (err) {
    console.error(err) 
    return { error: "Server Backend bermasalah" }
  }
}

export async function updateExcul(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const role = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (role !== "ADMIN" || !token) return { error: "Unauthorized" }

  const name = formData.get("name") as string

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/exculs/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name: name })
    });

    const data = await res.json();

    if (!res.ok) {
        return { error: data.message || "Gagal update ekskul" }
    }

    revalidatePath("/admin/ekskul")
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: "Server Backend bermasalah" }
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