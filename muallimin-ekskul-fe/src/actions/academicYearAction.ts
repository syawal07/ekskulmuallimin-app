'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export type ActionState = {
  error?: string
  success?: boolean
} | null

export async function createAcademicYear(prevState: ActionState, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const semester = formData.get("semester") as string

  if (!name || !semester) {
    return { error: "Tahun Pelajaran dan Semester wajib diisi." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/academic-years`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, semester })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan data." }
    }

    revalidatePath("/admin/sekolah")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function updateAcademicYear(id: string | number, prevState: ActionState, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const semester = formData.get("semester") as string

  if (!name || !semester) {
    return { error: "Tahun Pelajaran dan Semester wajib diisi." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/academic-years/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, semester })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal memperbarui data." }
    }

    revalidatePath("/admin/sekolah")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function deleteAcademicYear(id: string | number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/academic-years/${id}`, {
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

    revalidatePath("/admin/sekolah")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function setActiveAcademicYear(id: string | number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/academic-years/${id}/set-active`, {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const result = await res.json();

    if (!res.ok) {
       return { error: result.message || "Gagal mengaktifkan Tapel." }
    }

    revalidatePath("/admin/sekolah")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}