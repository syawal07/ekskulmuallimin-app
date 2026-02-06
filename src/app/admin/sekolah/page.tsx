import { getCompanyProfile } from "@/actions/settingAction"
import SchoolProfileForm from "@/components/admin/school-profile-form"

// Pastikan halaman ini selalu mengambil data terbaru (tidak di-cache statis)
export const dynamic = "force-dynamic"

export default async function ProfilSekolahPage() {
  // 1. Ambil data profil dari database (Server Side)
  const profile = await getCompanyProfile()

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profil Sekolah (CMS)</h1>
        <p className="text-slate-600">Atur konten yang tampil di halaman depan website.</p>
      </div>

      {/* 2. Panggil Component Form (Client Side) & kirim datanya */}
      <SchoolProfileForm initialData={profile} />
    </div>
  )
}