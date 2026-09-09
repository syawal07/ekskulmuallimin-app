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
export async function deletePerkaderanSession(date: string, perkaderanId: string, kelas: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) return { error: "Sesi tidak valid." }

    const params = new URLSearchParams()
    params.append("date", date)
    params.append("perkaderan_id", perkaderanId)
    if (kelas) params.append("kelas", kelas)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/mentor/perkaderan/attendance?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal menghapus sesi." }
    
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server" }
  }
}
export async function savePerkaderanAssessment(perkaderan_student_id: number, nilai: number, catatan: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return { error: "Sesi tidak valid atau telah habis." }
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${backendUrl}/mentor/perkaderan/assessments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        perkaderan_student_id,
        nilai,
        catatan
      })
    })

    const result = await res.json()

    if (!res.ok || !result.success) {
      return { error: result.message || "Gagal menyimpan nilai perkaderan." }
    }

    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan server saat menyimpan nilai." }
  }
}
export async function fetchAdminPerkaderanMonitor(perkaderanId: string, kelas: string, limit: string, page: number, search: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) return { error: "Sesi tidak valid atau telah habis." }

    const params = new URLSearchParams()
    if (perkaderanId && perkaderanId !== "all") params.append("perkaderan_id", perkaderanId)
    if (kelas && kelas !== "all") params.append("kelas", kelas)
    if (limit) params.append("limit", limit)
    if (page) params.append("page", page.toString())
    if (search) params.append("q", search)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/perkaderan/monitoring?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal memuat data dari server" }
    
    return { success: true, data: result }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server" }
  }
}

export async function fetchUnregisteredStudents(perkaderanId: string, search: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value
    if (!token) return { error: "Sesi tidak valid." }

    const params = new URLSearchParams({ perkaderan_id: perkaderanId })
    if (search) params.append("q", search)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/perkaderan/unregistered-students?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const result = await res.json()
    if (!res.ok) return { error: "Gagal memuat data santri" }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server" }
  }
}

export async function enrollStudentToPerkaderan(perkaderanId: string, studentIds: string[]) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value
    if (!token) return { error: "Sesi tidak valid." }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/perkaderan/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ perkaderan_id: perkaderanId, student_ids: studentIds })
    })

    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal mendaftarkan santri" }
    
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server" }
  }
}

// --- FETCH UNTUK PELATIH (MENTOR) ---

export async function fetchPerkaderanPresensiSetup(perkaderanId: string, kelas: string, limit: string, page: number, date: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) return { error: "Sesi tidak valid." }

    const params = new URLSearchParams()
    params.append("perkaderan_id", perkaderanId)
    if (kelas && kelas !== "all") params.append("kelas", kelas)
    if (limit) params.append("limit", limit)
    if (page) params.append("page", page.toString())
    if (date) params.append("date", date)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/mentor/perkaderan/presensi-setup?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal memuat data dari server" }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server" }
  }
}

export async function fetchMentorUnregisteredStudents(perkaderanId: string, search: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value
    if (!token) return { error: "Sesi tidak valid." }

    const params = new URLSearchParams({ perkaderan_id: perkaderanId })
    if (search) params.append("q", search)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/mentor/perkaderan/unregistered-students?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const result = await res.json()
    if (!res.ok) return { error: "Gagal memuat data santri" }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server" }
  }
}

export async function enrollStudentToPerkaderanMentor(perkaderanId: string, studentIds: string[]) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value
    if (!token) return { error: "Sesi tidak valid." }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/mentor/perkaderan/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ perkaderan_id: perkaderanId, student_ids: studentIds })
    })

    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal mendaftarkan santri" }
    
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server" }
  }
}
export async function fetchPerkaderanAssessmentSetup(perkaderanId: string, kelas: string, limit: string, page: number) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) return { error: "Sesi tidak valid." }

    const params = new URLSearchParams()
    params.append("perkaderan_id", perkaderanId)
    if (kelas && kelas !== "all") params.append("kelas", kelas)
    if (limit) params.append("limit", limit)
    if (page) params.append("page", page.toString())

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/mentor/perkaderan/assessments?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal memuat data dari server" }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server" }
  }
}