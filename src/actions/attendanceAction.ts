'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AttendanceStatus } from "@prisma/client"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

// ==========================================
// HELPER: DATE & FILE UTILS
// ==========================================

function getSafeDate(dateStr: string) {
  // Paksa jam 12 siang UTC agar tanggal tidak geser
  return new Date(`${dateStr}T12:00:00Z`)
}

async function saveProofImage(file: File): Promise<string | null> {
  // Validasi: Max 2MB
  if (file.size === 0) return null
  if (file.size > 2 * 1024 * 1024) throw new Error("Ukuran foto maksimal 2MB")
  
  // Validasi: Tipe File
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar")

  // Logika: Buat nama file unik
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Buat folder jika belum ada
  const uploadDir = join(process.cwd(), "public", "uploads", "proofs")
  await mkdir(uploadDir, { recursive: true })

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
  const extension = file.name.split('.').pop()
  const filename = `proof-${uniqueSuffix}.${extension}`
  
  // Tulis file ke disk
  await writeFile(join(uploadDir, filename), buffer)
  
  return `/uploads/proofs/${filename}`
}

// ==========================================
// MAIN ACTION: SUBMIT ATTENDANCE
// ==========================================

export async function submitAttendance(formData: FormData) {
  const cookieStore = await cookies()
  const recorderId = cookieStore.get("userId")?.value
  
  if (!recorderId) return { error: "Sesi habis, silakan login ulang." }

  const dateStr = formData.get("date") as string 
  const date = getSafeDate(dateStr)
  
  // Ambil File Foto
  const file = formData.get("proofImage") as File | null
  let proofImageUrl: string | null = null

  try {
    if (file && file.size > 0) {
      proofImageUrl = await saveProofImage(file)
    }
  } catch (err) {
    // PERBAIKAN DI SINI: Cek tipe error agar tidak pakai 'any'
    const message = err instanceof Error ? err.message : "Gagal upload gambar"
    return { error: message }
  }

  const entries = Array.from(formData.entries())
  const attendanceData = entries.filter(([key]) => key.startsWith("status-"))

  try {
    await prisma.$transaction(async (tx) => {
      for (const [key, statusRaw] of attendanceData) {
        const studentId = key.replace("status-", "")
        const notes = formData.get(`notes-${studentId}`) as string || ""
        const status = statusRaw as AttendanceStatus

        // Cek Data Lama
        const existingRecord = await tx.attendance.findFirst({
          where: { studentId: studentId, date: date }
        })

        if (existingRecord) {
          // Update: Foto hanya diupdate jika ada upload baru
          await tx.attendance.update({
            where: { id: existingRecord.id },
            data: { 
              status, 
              notes, 
              recorderId,
              proofImageUrl: proofImageUrl || existingRecord.proofImageUrl 
            }
          })
        } else {
          // Create Baru
          await tx.attendance.create({
            data: {
              date: date,
              status: status, 
              notes: notes,
              studentId: studentId,
              recorderId: recorderId, // Pastikan kolom ini ada di schema.prisma
              proofImageUrl: proofImageUrl // Pastikan kolom ini ada di schema.prisma
            }
          })
        }
      }
    }, {
      // 👇 INI KUNCINYA: Kita beri waktu lebih longgar
      maxWait: 5000, // Tunggu antrian koneksi max 5 detik
      timeout: 20000 // Biarkan proses berjalan max 20 detik (default cuma 5s)
    })

    revalidatePath("/mentor/dashboard")
    revalidatePath("/mentor/riwayat")
    
  } catch (error) {
    console.error("Gagal presensi:", error)
    return { error: "Gagal menyimpan data presensi." }
  }

  redirect("/mentor/riwayat?success=true")
}

// ==========================================
// ACTION: DELETE SESSION
// ==========================================

export async function deleteAttendanceSession(dateStr: string, exculId: string) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  
  if (!userId) return { error: "Unauthorized" }

  const startOfDay = new Date(`${dateStr}T00:00:00Z`)
  const endOfDay = new Date(`${dateStr}T23:59:59Z`)

  try {
    await prisma.attendance.deleteMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        recorderId: userId, 
        student: { exculId: exculId }
      }
    })

    revalidatePath("/mentor/riwayat")
    revalidatePath("/mentor/dashboard")
    
  } catch (error) {
    console.error("Gagal hapus:", error)
    return { error: "Gagal menghapus sesi presensi." }
  }

  redirect("/mentor/riwayat")
}