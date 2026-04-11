'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function uploadGalleryImage(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) {
    return { error: "Sesi habis, silakan login ulang." }
  }

  const title = formData.get("title") as string
  const file = formData.get("image") as File | null

  if (!title || !file || file.size === 0) {
    return { error: "Judul dan Foto wajib diisi." }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Ukuran foto maksimal 5MB." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    
    const res = await fetch(`${apiUrl}/admin/galleries`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData 
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan foto di server." }
    }

    revalidatePath("/admin/galeri")
    revalidatePath("/") 
    return { success: true }

  } catch (error) {
    return { error: "Terjadi kesalahan server saat menghubungi API." }
  }
}

export async function deleteGalleryImage(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Unauthorized" }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/galleries/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
       return { error: "Gagal menghapus foto dari server." }
    }

    revalidatePath("/admin/galeri")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan server saat menghubungi API." }
  }
}