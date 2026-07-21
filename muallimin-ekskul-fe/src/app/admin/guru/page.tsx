import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Suspense } from "react"
import SearchInput from "@/components/admin/search-input"
import GuruTableClient from "@/components/admin/guru-table-client"
import ImportGuruButton from "@/components/admin/import-guru-button"
import WipeGuruButton from "@/components/admin/wipe-guru-button"

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

interface MentorResponse {
  data: MentorItem[];
  total: number;
  last_page: number;
}

async function getMentors(page: number, q: string, role: string): Promise<MentorResponse> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    
    if (!token || !apiUrl) return { data: [], total: 0, last_page: 1 };

    const queryParams = new URLSearchParams({
      page: page.toString(),
      q: q || "",
      role: role || "",
      limit: "10"
    });

    const res = await fetch(`${apiUrl}/admin/mentors?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })

    if (!res.ok) return { data: [], total: 0, last_page: 1 };
    const result = await res.json()
    
    return {
      data: result.data.data,
      total: result.data.total,
      last_page: result.data.last_page
    }
  } catch (e) {
    return { data: [], total: 0, last_page: 1 };
  }
}

export default async function GuruPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; q?: string; role?: string }> 
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.q || ""
  const roleFilter = params.role || ""
  
  const mentorData = await getMentors(page, search, roleFilter)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Guru / Pembina</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data pembina ekskul dan perkaderan</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <WipeGuruButton />
          <ImportGuruButton />
          <Link href="/admin/guru/baru">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm rounded-xl h-10">
              <Plus className="w-4 h-4 mr-2" /> Tambah Guru
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <Suspense fallback={null}>
            <SearchInput placeholder="Cari nama atau username..." />
          </Suspense>
          <div className="flex gap-2">
             <Link href="/admin/guru" scroll={false}>
               <span className={`px-3 py-1.5 text-xs font-medium rounded-md border ${!roleFilter ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Semua</span>
             </Link>
             <Link href={`/admin/guru?role=MENTOR&q=${search}`} scroll={false}>
               <span className={`px-3 py-1.5 text-xs font-medium rounded-md border ${roleFilter === 'MENTOR' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Pelatih Ekskul</span>
             </Link>
             <Link href={`/admin/guru?role=PEMBINA&q=${search}`} scroll={false}>
               <span className={`px-3 py-1.5 text-xs font-medium rounded-md border ${roleFilter === 'PEMBINA' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Pembina Perkaderan</span>
             </Link>
          </div>
        </div>

        <GuruTableClient 
          mentors={mentorData.data}
          page={page}
          limit={10}
          totalPages={mentorData.last_page}
          search={search}
          roleFilter={roleFilter}
        />
      </div>
    </div>
  )
}