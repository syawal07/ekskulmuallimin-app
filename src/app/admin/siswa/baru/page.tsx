import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
// Import Form Client yang baru kita buat
import CreateStudentForm from "@/components/admin/create-student-form"

export default async function AddStudentPage() {
  // 1. AMBIL DATA EKSKUL DI SERVER
  const exculs = await prisma.excul.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/siswa">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Siswa Baru</h1>
          <p className="text-slate-500 text-sm">Daftarkan siswa ke dalam ekstrakurikuler.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-800">Form Data Siswa</CardTitle>
              <CardDescription>Pastikan nama dan pilihan ekskul benar.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          
          {/* 2. PANGGIL KOMPONEN FORM (Oper data ekskul ke sini) */}
          <CreateStudentForm exculs={exculs} />

        </CardContent>
      </Card>
    </div>
  )
}