'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { CampusLocation } from "@prisma/client" 

export async function createExcul(formData: FormData) {
  const cookieStore = await cookies()
  const role = cookieStore.get("userRole")?.value
  if (role !== "ADMIN") return { error: "Unauthorized" }

  const name = formData.get("name") as string

  if (!name) return { error: "Nama ekskul wajib diisi" }

  try {
    await prisma.excul.create({
      data: { 
        name,
        // PERBAIKAN: Gunakan salah satu opsi yang valid (INDUK atau TERPADU)
        location: CampusLocation.INDUK 
      }
    })
    revalidatePath("/admin/ekskul")
    return { success: true }
  } catch (err) {
    console.log(err) 
    return { error: "Gagal membuat ekskul" }
  }
}

export async function updateExcul(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const role = cookieStore.get("userRole")?.value
  if (role !== "ADMIN") return { error: "Unauthorized" }

  const name = formData.get("name") as string

  try {
    await prisma.excul.update({
      where: { id },
      data: { name }
    })
    revalidatePath("/admin/ekskul")
    return { success: true }
  } catch (err) {
    console.log(err)
    return { error: "Gagal update ekskul" }
  }
}

export async function deleteExcul(id: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get("userRole")?.value
  if (role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.excul.delete({
      where: { id }
    })
    revalidatePath("/admin/ekskul")
    return { success: true }
  } catch (err) {
    console.log(err)
    return { error: "Gagal menghapus. Pastikan tidak ada siswa di ekskul ini." }
  }
}