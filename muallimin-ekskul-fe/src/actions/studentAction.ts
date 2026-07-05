'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export type StudentState = {
  error?: string
  success?: boolean
} | null

type ImportData = {
  name: string
  class: string
  nis?: string
  nisn?: string
  jenis_kelamin?: string
  angkatan?: string
  jabatan_organisasi?: string
  perkaderanName?: string
  exculName: string
}

export async function createStudent(prevState: StudentState, formData: FormData) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized: Hanya Admin yang boleh akses." }
  }

  const name = formData.get("name") as string
  const kelas = formData.get("class") as string
  const exculIds = formData.getAll("exculId") as string[]
  const perkaderanIds = formData.getAll("perkaderanIds") as string[]

  if (!name || !kelas || exculIds.length === 0) {
    return { error: "Nama, Kelas, dan minimal 1 Ekskul wajib diisi." }
  }

  const payload = new FormData()
  payload.append('name', name)
  payload.append('class', kelas)
  
  exculIds.forEach(id => payload.append('excul_id[]', id))
  perkaderanIds.forEach(id => payload.append('perkaderan_ids[]', id))
  
  if (formData.get("nis")) payload.append('nis', formData.get("nis") as string)
  if (formData.get("nisn")) payload.append('nisn', formData.get("nisn") as string)
  if (formData.get("jenis_kelamin")) payload.append('jenis_kelamin', formData.get("jenis_kelamin") as string)
  if (formData.get("angkatan")) payload.append('angkatan', formData.get("angkatan") as string)
  if (formData.get("jabatan_organisasi")) payload.append('jabatan_organisasi', formData.get("jabatan_organisasi") as string)
  if (formData.get("jabatan_perkaderan")) payload.append('jabatan_perkaderan', formData.get("jabatan_perkaderan") as string)
  
  const foto = formData.get("foto") as File
  if (foto && foto.size > 0) {
    payload.append('foto', foto)
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/students`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: payload
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan data siswa." }
    }

    revalidatePath("/admin/siswa")
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }

  redirect("/admin/siswa?success=true")
}

export async function deleteStudent(studentId: string) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/students/${studentId}`, {
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

    revalidatePath("/admin/siswa")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function importStudents(data: ImportData[]) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/students/import`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ students: data })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal import data. Cek format Excel Anda." }
    }

    revalidatePath("/admin/siswa")
    return { success: true, count: result.data?.count || 0 }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}

export async function updateStudent(
  id: string, 
  prevState: unknown, 
  formData: FormData
) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const kelas = formData.get("class") as string
  const exculIds = formData.getAll("exculId") as string[]
  const perkaderanIds = formData.getAll("perkaderanIds") as string[]

  if (!name || !kelas || exculIds.length === 0) {
    return { error: "Nama, Kelas, dan minimal 1 Ekskul wajib diisi." }
  }

  const payload = new FormData()
  payload.append('_method', 'PUT')
  payload.append('name', name)
  payload.append('class', kelas)
  
  exculIds.forEach(id => payload.append('excul_id[]', id))
  perkaderanIds.forEach(id => payload.append('perkaderan_ids[]', id))
  
  if (formData.get("nis")) payload.append('nis', formData.get("nis") as string)
  if (formData.get("nisn")) payload.append('nisn', formData.get("nisn") as string)
  if (formData.get("jenis_kelamin")) payload.append('jenis_kelamin', formData.get("jenis_kelamin") as string)
  if (formData.get("angkatan")) payload.append('angkatan', formData.get("angkatan") as string)
  if (formData.get("jabatan_organisasi")) payload.append('jabatan_organisasi', formData.get("jabatan_organisasi") as string)
  if (formData.get("jabatan_perkaderan")) payload.append('jabatan_perkaderan', formData.get("jabatan_perkaderan") as string)
  if (formData.get("is_active")) payload.append('is_active', formData.get("is_active") as string)
  
  const foto = formData.get("foto") as File
  if (foto && foto.size > 0) {
    payload.append('foto', foto)
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/students/${id}`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: payload
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan perubahan." }
    }

    revalidatePath("/admin/siswa")
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }

  redirect("/admin/siswa?success=updated")
}

export async function createStudentByMentor(prevState: StudentState, formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  
  if (!token) {
    return { error: "Sesi tidak valid, silakan login ulang." }
  }

  const name = formData.get("name") as string
  const kelas = formData.get("class") as string
  const nis = formData.get("nis") as string
  const exculId = formData.get("exculId") as string

  if (!name || !kelas || !exculId) {
    return { error: "Nama, Kelas, dan Ekskul wajib diisi." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/mentor/students`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        class: kelas,
        nis: nis || null,
        excul_id: [exculId]
      })
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan data siswa." }
    }

    revalidatePath("/mentor/dashboard")
    revalidatePath("/mentor/presensi-setup")
    
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}
export async function bulkDeleteStudents(studentIds: string[]) {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  if (!studentIds || studentIds.length === 0) {
    return { error: "Tidak ada data siswa yang dipilih." }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/students/bulk-delete`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ ids: studentIds })
    });

    const result = await res.json();

    if (!res.ok) {
       return { error: result.message || "Gagal menghapus data massal." }
    }

    revalidatePath("/admin/siswa")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}
export async function wipeAllStudents() {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  const token = cookieStore.get("session_token")?.value
  
  if (userRole !== "ADMIN" || !token) {
    return { error: "Unauthorized" }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/admin/students/wipe`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const result = await res.json();

    if (!res.ok) {
       return { error: result.message || "Gagal mengosongkan data." }
    }

    revalidatePath("/admin/siswa")
    return { success: true }
  } catch (error) {
    return { error: "Server Backend bermasalah." }
  }
}