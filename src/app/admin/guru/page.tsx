import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserPlus, User } from "lucide-react"
import GuruActionButtons from "@/components/admin/guru-action-buttons" // Komponen Tombol Aksi (Hapus/Reset)

export const dynamic = "force-dynamic"

export default async function AdminGuruPage() {
  // 1. AMBIL DATA GURU (MENTOR) DARI DATABASE
  const mentors = await prisma.user.findMany({
    where: { role: "MENTOR" },
    orderBy: { name: 'asc' },
    include: {
      mentoringExculs: true // Ambil data ekskul yang diajar
    }
  })

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Guru / Mentor</h1>
          <p className="text-slate-600">Manajemen akun pengajar ekstrakurikuler.</p>
        </div>
        
        {/* Tombol ke Halaman Tambah Baru */}
        <Link href="/admin/guru/baru">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20">
            <UserPlus className="w-4 h-4 mr-2" /> Tambah Guru Baru
          </Button>
        </Link>
      </div>

      {/* Tabel Data Guru */}
      <Card className="p-6 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">
             Total Pengajar: <span className="text-emerald-600">{mentors.length}</span>
          </h2>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">No</th>
                <th className="px-6 py-4 font-bold">Nama Lengkap</th>
                <th className="px-6 py-4 font-bold">Username Login</th>
                <th className="px-6 py-4 font-bold">Ekskul Diampu</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {mentors.length > 0 ? (
                mentors.map((mentor, index) => (
                  <tr key={mentor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-500">{index + 1}</td>
                    
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <User className="w-4 h-4" />
                        </div>
                        {mentor.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 font-mono bg-slate-50/50 rounded px-2 w-fit">
                      @{mentor.username}
                    </td>

                    {/* Kolom Ekskul */}
                    <td className="px-6 py-4 text-slate-600">
                      {mentor.mentoringExculs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mentor.mentoringExculs.map(excul => (
                            <span key={excul.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                              {excul.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">- Belum ditugaskan -</span>
                      )}
                    </td>

                    {/* Tombol Aksi (Hapus/Reset) */}
                    <td className="px-6 py-4 text-center">
                      <GuruActionButtons 
                        userId={mentor.id} 
                        userName={mentor.name} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                    <div className="flex flex-col items-center gap-2">
                      <User className="w-8 h-8 opacity-50" />
                      <p>Belum ada data guru. Silakan tambah baru.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}