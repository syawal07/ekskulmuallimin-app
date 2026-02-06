'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

// 1. Definisikan Tipe State
export type StudentState = {
  error?: string
  success?: boolean
} | null

// ==========================================
// 1. CREATE STUDENT (Tambah Siswa Satu per Satu)
// ==========================================
// 2. PERBAIKAN DI SINI: Ganti 'any' dengan 'StudentState'
export async function createStudent(prevState: StudentState, formData: FormData) {
  
  // Cek Keamanan: Pastikan yang request adalah ADMIN
  const cookieStore = await cookies()
  const userRole = cookieStore.get("userRole")?.value
  
  if (userRole !== "ADMIN") {
    return { error: "Unauthorized: Hanya Admin yang boleh akses." }
  }

  // Ambil data dari Form
  const name = formData.get("name") as string
  const kelas = formData.get("class") as string
  const nis = formData.get("nis") as string
  const exculId = formData.get("exculId") as string

  // Validasi
  if (!name || !kelas || !exculId) {
    return { error: "Nama, Kelas, dan Ekskul wajib diisi." }
  }

  try {
    // Simpan ke Database
    await prisma.student.create({
      data: {
        name,
        class: kelas,
        nis: nis || null, 
        exculId,          
        isActive: true
      }
    })

    // Refresh halaman Admin Siswa biar data baru muncul
    revalidatePath("/admin/siswa")
    
  } catch (error) {
    console.error("Gagal tambah siswa:", error)
    return { error: "Gagal menyimpan data siswa." }
  }

  // Redirect kembali ke tabel siswa jika sukses
  redirect("/admin/siswa?success=true")
}

// ==========================================
// 2. DELETE STUDENT (Hapus Siswa)
// ==========================================
export async function deleteStudent(studentId: string) {
  // Cek Keamanan
  const cookieStore = await cookies()
  if (cookieStore.get("userRole")?.value !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.student.delete({
      where: { id: studentId }
    })

    revalidatePath("/admin/siswa")
    return { success: true }
  } catch (error) {
    console.error("Gagal hapus:", error)
    return { error: "Gagal menghapus (Mungkin ada data presensi terkait)." }
  }
}
// ==========================================
// 3. IMPORT SISWA MASSAL (EXCEL)
// ==========================================
// Definisi tipe data baris Excel
type ImportData = {
  name: string
  class: string
  nis?: string
  exculName: string // Kita pakai nama ekskul (Futsal, Tari) dari Excel
}

export async function importStudents(data: ImportData[]) {
  // Cek Admin
  const cookieStore = await cookies()
  if (cookieStore.get("userRole")?.value !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    // 1. Ambil semua ekskul dari Database untuk dicocokkan namanya
    const allExculs = await prisma.excul.findMany()
    
    // 2. Siapkan wadah data yang valid
    const validStudents = []
    
    for (const row of data) {
      // Validasi sederhana: Lewati jika Nama/Kelas/Ekskul kosong
      if (!row.name || !row.class || !row.exculName) continue 

      // Cari ID Ekskul berdasarkan Nama (Case Insensitive: "futsal" == "Futsal")
      const excul = allExculs.find(e => 
        e.name.toLowerCase().trim() === row.exculName.toString().toLowerCase().trim()
      )

      if (excul) {
        validStudents.push({
          name: row.name,
          class: row.class.toString(),
          nis: row.nis ? row.nis.toString() : null,
          exculId: excul.id, 
          isActive: true
        })
      }
    }

    if (validStudents.length === 0) {
      return { error: "Tidak ada data valid atau Nama Ekskul di Excel tidak cocok dengan Database." }
    }

    // 3. Masukkan ke Database Sekaligus (Bulk Insert)
    await prisma.student.createMany({
      data: validStudents
    })

    revalidatePath("/admin/siswa")
    return { success: true, count: validStudents.length }

  } catch (error) {
    console.error("Import error:", error)
    return { error: "Gagal import data. Cek format Excel Anda." }
  }
}
// ==========================================
// 4. UPDATE STUDENT (EDIT DATA)
// ==========================================
export async function updateStudent(
  id: string, 
  prevState: StudentState, 
  formData: FormData
) {
  // 1. Cek Admin
  const cookieStore = await cookies()
  if (cookieStore.get("userRole")?.value !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  // 2. Ambil data dari form
  const name = formData.get("name") as string
  const kelas = formData.get("class") as string
  const nis = formData.get("nis") as string
  const exculId = formData.get("exculId") as string

  // 3. Validasi
  if (!name || !kelas || !exculId) {
    return { error: "Nama, Kelas, dan Ekskul wajib diisi." }
  }

  try {
    // 4. Update ke Database
    await prisma.student.update({
      where: { id },
      data: {
        name,
        class: kelas,
        nis: nis || null,
        exculId
      }
    })

    // 5. Refresh halaman admin
    revalidatePath("/admin/siswa")
    
  } catch (error) {
    console.error("Gagal update:", error)
    return { error: "Gagal menyimpan perubahan. Cek koneksi internet." }
  }

  // 6. Redirect balik jika sukses
  redirect("/admin/siswa?success=updated")
}