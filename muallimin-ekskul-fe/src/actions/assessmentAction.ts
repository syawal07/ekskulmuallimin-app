'use server'

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function uploadAssessmentExcel(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis, silakan login ulang." }

  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

  try {
    const res = await fetch(`${apiUrl}/mentor/assessments/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal mengunggah file penilaian." }
    }

    revalidatePath("/mentor/penilaian")
    return { success: true, message: result.message }
  } catch (error) {
    return { error: "Terjadi kesalahan pada server saat mengunggah." }
  }
}
export async function updateAssessmentScore(id: string, score: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  if (!token) return { error: "Sesi habis" }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/mentor/assessments/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ score })
    })
    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal update" }
    
    revalidatePath("/mentor/penilaian")
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan sistem" }
  }
}

export async function deleteAssessment(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  if (!token) return { error: "Sesi habis" }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/mentor/assessments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) return { error: "Gagal menghapus data" }
    
    revalidatePath("/mentor/penilaian")
    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan sistem" }
  }
}
export async function fetchAdminAssessments(exculId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis, silakan login ulang." }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/assessments?excul_id=${exculId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })
    
    const result = await res.json()
    if (!res.ok) return { error: result.message || "Gagal mengambil data." }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi kesalahan sistem saat mengambil data." }
  }
}