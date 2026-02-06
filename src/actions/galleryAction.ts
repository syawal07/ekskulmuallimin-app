'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"

// --- 1. UPLOAD GAMBAR GALERI ---
export async function uploadGalleryImage(formData: FormData) {
  const title = formData.get("title") as string
  const file = formData.get("image") as File | null

  if (!title || !file || file.size === 0) {
    return { error: "Judul dan Foto wajib diisi." }
  }

  // Validasi ukuran (Max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Ukuran foto maksimal 5MB." }
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Simpan ke folder public/uploads/gallery
    const uploadDir = join(process.cwd(), "public", "uploads", "gallery")
    await mkdir(uploadDir, { recursive: true })

    const filename = `gal-${Date.now()}.${file.name.split('.').pop()}`
    const filepath = join(uploadDir, filename)
    
    await writeFile(filepath, buffer)
    const imageUrl = `/uploads/gallery/${filename}`

    // Simpan ke Database
    await prisma.gallery.create({
      data: {
        title,
        imageUrl
      }
    })

    revalidatePath("/admin/galeri")
    revalidatePath("/") // Refresh halaman depan juga
    return { success: true }

  } catch (error) {
    console.error("Gagal upload galeri:", error)
    return { error: "Gagal menyimpan foto." }
  }
}

// --- 2. HAPUS GAMBAR GALERI ---
export async function deleteGalleryImage(id: string) {
  try {
    const item = await prisma.gallery.findUnique({ where: { id } })
    
    if (item) {
      // Hapus data di DB
      await prisma.gallery.delete({ where: { id } })
      
      // Opsional: Hapus file fisik (hati-hati di Vercel, file mungkin sdh hilang dluan)
      // const filepath = join(process.cwd(), "public", item.imageUrl)
      // await unlink(filepath).catch(() => {}) 
    }

    revalidatePath("/admin/galeri")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { error: "Gagal menghapus foto." }
  }
}