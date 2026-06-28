import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import GuruActionButtons from "@/components/admin/guru-action-buttons"

interface RelasiItem {
  id: number | string;
  name?: string;
  nama_jenjang?: string;
}

interface MentorItem {
  id: number | string;
  name: string;
  username: string;
  role: string;
  mentoring_exculs?: RelasiItem[];
  mentoringExculs?: RelasiItem[];
  perkaderans?: RelasiItem[];
}

async function getMentors(role?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const roleFilter = role ? `?role=${role}` : ""
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/admin/mentors${roleFilter}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  })

  if (!res.ok) return []
  const result = await res.json()
  return result.data || []
}

export default async function GuruPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedSearchParams = await searchParams
  const role = typeof resolvedSearchParams.role === 'string' ? resolvedSearchParams.role : undefined
  
  const mentors = await getMentors(role)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Guru / Pembina</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data pembina ekskul dan perkaderan</p>
        </div>
        <Link href="/admin/guru/baru">
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm rounded-xl h-10">
            <Plus className="w-4 h-4 mr-2" /> Tambah Guru
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari guru..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all bg-white"
            />
          </div>
          <div className="flex gap-2">
             <Link href="/admin/guru">
               <span className={`px-3 py-1.5 text-xs font-medium rounded-md border ${!role ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Semua</span>
             </Link>
             <Link href="/admin/guru?role=MENTOR">
               <span className={`px-3 py-1.5 text-xs font-medium rounded-md border ${role === 'MENTOR' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Pelatih Ekskul</span>
             </Link>
             <Link href="/admin/guru?role=PEMBINA">
               <span className={`px-3 py-1.5 text-xs font-medium rounded-md border ${role === 'PEMBINA' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Pembina Perkaderan</span>
             </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role & Hak Akses</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-600 bg-white">
              {mentors.map((item: MentorItem) => {
                const isMentor = item.role === 'MENTOR'
                const relasi = isMentor ? (item.mentoring_exculs || item.mentoringExculs || []) : (item.perkaderans || [])
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-slate-500">@{item.username}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`w-fit inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isMentor ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                          {isMentor ? 'Pelatih Ekskul' : 'Pembina Perkaderan'}
                        </span>
                        {relasi.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {relasi.map((r: RelasiItem) => (
                              <span key={r.id} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[11px] whitespace-nowrap">
                                {isMentor ? r.name : r.nama_jenjang}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-red-500 italic">Belum ada tanggungan</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <GuruActionButtons userId={item.id.toString()} userName={item.name} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}