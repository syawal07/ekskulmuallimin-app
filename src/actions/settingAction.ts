'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { Prisma } from "@prisma/client" 

// --- HELPER UPLOAD GAMBAR ---
async function uploadFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = join(process.cwd(), "public", "uploads", "cms")
  await mkdir(uploadDir, { recursive: true })

  const filename = `${folder}-${Date.now()}.${file.name.split('.').pop()}`
  await writeFile(join(uploadDir, filename), buffer)

  return `/uploads/cms/${filename}`
}

export async function getCompanyProfile() {
  let profile = await prisma.companyProfile.findFirst()

  // PERBAIKAN DI SINI:
  // Jika data belum ada, kita buat baru dengan mengisi SEMUA field wajib
  if (!profile) {
    profile = await prisma.companyProfile.create({
      data: { 
        schoolName: "Madrasah Mu'allimin",
        // Field di bawah ini WAJIB ada sesuai schema.prisma (tanpa tanda tanya)
        heroTitle: "Wadah Kreativitas",
        heroSubtitle: "Kader Pemimpin",
        heroDescription: "Platform digital manajemen kegiatan ekstrakurikuler untuk memantau perkembangan minat dan bakat secara real-time.",
        aboutText: "Madrasah Mu'allimin Muhammadiyah Yogyakarta adalah sekolah kader persyarikatan yang berkomitmen mencetak calon pemimpin umat dan bangsa.",
        // Field optional boleh tidak diisi (email, phone, dll)
      }
    })
  }
  return profile
}

export async function updateCompanyProfile(formData: FormData) {
  const profile = await prisma.companyProfile.findFirst()
  if (!profile) return { error: "Data profil tidak ditemukan" }

  // --- LOGIKA SMART PATCHING (Agar data tab lain tidak hilang) ---
  const getVal = (key: string) => {
    const value = formData.get(key)
    if (value === null) return undefined // Jangan update kalau null (artinya input ada di tab lain)
    return value as string
  }

  const dataToUpdate: Prisma.CompanyProfileUpdateInput = {
    // School Name Wajib ada, jadi kita kasih fallback jika string kosong
    schoolName: formData.get("schoolName") ? (formData.get("schoolName") as string) : undefined,
    
    // Gunakan getVal untuk field lain
    heroTitle: getVal("heroTitle"),
    heroSubtitle: getVal("heroSubtitle"),
    heroDescription: getVal("heroDescription"),
    aboutText: getVal("aboutText"),
    email: getVal("email"),
    phone: getVal("phone"),
    address: getVal("address"),
    website: getVal("website"),
    loginQuote: getVal("loginQuote"),
    loginQuoteAuthor: getVal("loginQuoteAuthor"),
  }

  // Cek Upload (Hanya update jika ada file baru)
  const logoFile = formData.get("logo") as File | null
  const heroFile = formData.get("heroImage") as File | null
  const loginFile = formData.get("loginImage") as File | null

  if (logoFile && logoFile.size > 0) {
    dataToUpdate.logoUrl = await uploadFile(logoFile, "logo")
  }
  if (heroFile && heroFile.size > 0) {
    dataToUpdate.heroImageUrl = await uploadFile(heroFile, "hero")
  }
  if (loginFile && loginFile.size > 0) {
    dataToUpdate.loginImageUrl = await uploadFile(loginFile, "login-bg")
  }

  try {
    await prisma.companyProfile.update({
      where: { id: profile.id },
      data: dataToUpdate
    })

    revalidatePath("/admin/sekolah")
    revalidatePath("/") 
    revalidatePath("/login")
    
    return { success: true }
  } catch (error) {
    console.error("Gagal update profil:", error)
    return { error: "Gagal menyimpan perubahan." }
  }
}