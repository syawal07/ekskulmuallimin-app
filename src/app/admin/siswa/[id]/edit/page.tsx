import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserCog } from "lucide-react"
import Link from "next/link"
import EditStudentForm from "@/components/admin/edit-student-form" 

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1. Ambil Data Siswa
  const student = await prisma.student.findUnique({
    where: { id }
  })

  // 2. Ambil Daftar Ekskul
  const exculs = await prisma.excul.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  if (!student) return notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/siswa">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Data Siswa</h1>
          <p className="text-slate-500 text-sm">Perbarui informasi siswa.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-800">Form Edit</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          
          <EditStudentForm student={student} exculs={exculs} />

        </CardContent>
      </Card>
    </div>
  )
}