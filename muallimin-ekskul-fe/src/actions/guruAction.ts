"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export type GuruState = {
  error?: string
  success?: boolean
} | null

export async function createGuru(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const exculIds = formData.getAll("exculIds") as string[]

  if (!name || !username || !password) {
    return { error: "Nama, Username, dan Password wajib diisi." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/mentors`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        username,
        password,
        excul_ids: exculIds
      })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan data guru." }
    }

    revalidatePath("/admin/guru")
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }

  redirect("/admin/guru?success=true")
}

export async function updateGuru(id: string, prevState: unknown, formData: FormData) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const exculIds = formData.getAll("exculIds") as string[]

  if (!name || !username) {
    return { error: "Nama dan Username wajib diisi." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/mentors/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        username,
        password: password || null,
        excul_ids: exculIds
      })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan perubahan." }
    }

    revalidatePath("/admin/guru")
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }

  redirect("/admin/guru?success=updated")
}

export async function deleteGuru(id: string) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/mentors/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const result = await res.json();

    if (!res.ok) {
       return { error: result.message || "Gagal menghapus data guru." }
    }

    revalidatePath("/admin/guru")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}