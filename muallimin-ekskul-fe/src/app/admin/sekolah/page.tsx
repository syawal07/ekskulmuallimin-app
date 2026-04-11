import SchoolProfileForm from "@/components/admin/school-profile-form"
import { cookies } from "next/headers"

// Pastikan halaman ini selalu mengambil data terbaru (tidak di-cache statis)
export const dynamic = "force-dynamic"

async function getCompanyProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

  if (!token || !apiUrl) return {};

  try {
    const res = await fetch(`${apiUrl}/admin/company-profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return {};
    const result = await res.json();
    return result.data || {};
  } catch (e) {
    return {};
  }
}

export default async function ProfilSekolahPage() {
  // 1. Ambil data profil dari API Laravel
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