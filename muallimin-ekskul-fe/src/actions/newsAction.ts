'use server'

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function fetchAdminNews() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis, silakan login ulang." }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/news`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })
    
    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal mengambil data berita." }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi gangguan koneksi ke server backend." }
  }
}

export async function submitNews(formData: FormData, id?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis." }

  try {
    const isUpdate = !!id
    const url = isUpdate 
      ? `${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/news/${id}`
      : `${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/news`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    })

    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal menyimpan berita." }

    revalidatePath('/admin/berita')
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan sistem." }
  }
}

export async function deleteNews(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis." }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/news/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal menghapus berita." }

    revalidatePath('/admin/berita')
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan sistem." }
  }
}