'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export type ActionState = {
  error?: string
  success?: boolean
} | null

// --- BAGIAN 1: FUNGSI UNTUK ADMIN ---

export async function createPerkaderan(prevState: ActionState, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized: Hanya Admin yang boleh akses." }
  }

  const nama_jenjang = formData.get("nama_jenjang") as string
  const kategori = formData.get("kategori") as string
  const target_kelas = formData.get("target_kelas") as string
  const deskripsi = formData.get("deskripsi") as string

  if (!nama_jenjang || !kategori) {
    return { error: "Nama Jenjang dan Kategori wajib diisi." }
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
      body: JSON.stringify({ 
        nama_jenjang, 
        kategori,
        target_kelas: target_kelas || null,
        deskripsi 
      })
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
  const kategori = formData.get("kategori") as string
  const target_kelas = formData.get("target_kelas") as string
  const deskripsi = formData.get("deskripsi") as string

  if (!nama_jenjang || !kategori) {
    return { error: "Nama Jenjang dan Kategori wajib diisi." }
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
      body: JSON.stringify({ 
        nama_jenjang, 
        kategori,
        target_kelas: target_kelas || null,
        deskripsi 
      })
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


// --- BAGIAN 2: FUNGSI UNTUK MENTOR/PEMBINA PERKADERAN ---

export async function submitPerkaderanAttendance(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return { error: "Sesi tidak valid" }

  const date = formData.get("date") as string
  const perkaderanId = formData.get("perkaderanId") as string

  if (!date || !perkaderanId) return { error: "Tanggal dan Jenjang Perkaderan wajib diisi" }

  try {
    const response = await fetch(`${apiUrl}/mentor/perkaderan/attendance`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      body: formData,
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      return { error: result.message || "Gagal menyimpan presensi" }
    }
    
    revalidatePath("/mentor/dashboard")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/perkaderan/monitoring")
    revalidatePath("/mentor/perkaderan/presensi")
    revalidatePath("/mentor/perkaderan/riwayat")
    revalidatePath("/wali/dashboard")
    revalidatePath("/wali/attendances")
    
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan koneksi ke server" }
  }
}
export async function deletePerkaderanSession(date: string, perkaderanId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return { error: "Sesi tidak valid" }

  try {
    const res = await fetch(`${apiUrl}/mentor/perkaderan/attendance?date=${date}&perkaderan_id=${perkaderanId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const result = await res.json();

    if (!res.ok) {
       return { error: result.message || "Gagal menghapus sesi presensi." }
    }

    revalidatePath("/mentor/perkaderan/riwayat")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function savePerkaderanAssessment(perkaderanStudentId: number, nilai: number, catatan: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl) return { error: "Sesi tidak valid" }

  try {
    const res = await fetch(`${apiUrl}/mentor/perkaderan/assessments`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        perkaderan_student_id: perkaderanStudentId,
        nilai: nilai,
        catatan: catatan || ""
      })
    });

   const result = await res.json();
    if (!res.ok) return { error: result.message || "Gagal menyimpan nilai." }
    revalidatePath("/mentor/dashboard")
    revalidatePath("/admin/perkaderan/monitoring")
    revalidatePath("/mentor/perkaderan/penilaian")
    
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}