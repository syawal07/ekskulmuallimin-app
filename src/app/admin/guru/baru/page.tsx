import { prisma } from "@/lib/prisma"
import GuruFormClient from "@/components/admin/guru-form-client" // Import komponen yang kita buat di Langkah 1

export const dynamic = "force-dynamic"

export default async function AddGuruPage() {
  // 1. AMBIL DATA EKSKUL DARI DATABASE (Server Side)
  const exculs = await prisma.excul.findMany({
    orderBy: { name: 'asc' }
  })

  // 2. Panggil Komponen Client (Form UI) sambil membawa data ekskul
  return <GuruFormClient exculs={exculs} />
}