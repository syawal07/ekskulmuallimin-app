'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function submitAttendance(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  
  if (!token) return { error: "Sesi habis, silakan login ulang." }

  const file = formData.get("proofImage") as File | null;
  if (!file || file.size === 0) {
      formData.delete("proofImage");
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    
    const res = await fetch(`${apiUrl}/mentor/attendance`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json' 
      },
      body: formData 
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan data presensi. Periksa kembali form Anda." }
    }

    revalidatePath("/mentor/dashboard")
    revalidatePath("/mentor/riwayat")
    
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal presensi"
    return { error: "Terjadi kesalahan server: " + message }
  }

  redirect("/mentor/riwayat?success=true")
}

export async function deleteAttendanceSession(dateStr: string, exculId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  
  if (!token) return { error: "Unauthorized" }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/mentor/attendance?date=${dateStr}&excul_id=${exculId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
        return { error: "Gagal menghapus sesi presensi." }
    }

    revalidatePath("/mentor/riwayat")
    revalidatePath("/mentor/dashboard")
    
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }

  redirect("/mentor/riwayat")
}