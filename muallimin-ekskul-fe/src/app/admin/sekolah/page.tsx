import { cookies } from "next/headers"
import SchoolProfileForm from "@/components/admin/school-profile-form"
import { AcademicYearForm } from "@/components/admin/academic-year-form"
import { AcademicYearTable } from "@/components/admin/academic-year-table"

async function getData() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  const [resProfile, resYears] = await Promise.all([
    fetch(`${apiUrl}/admin/company-profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`${apiUrl}/academic-years`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  ])

  const profileData = resProfile.ok ? await resProfile.json() : { data: null }
  const yearsData = resYears.ok ? await resYears.json() : { data: [] }

  return {
    profile: profileData.data,
    years: yearsData.data || [],
  }
}

export default async function SekolahPage() {
  const { profile, years } = await getData()

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Pengaturan Sekolah</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola informasi profil lembaga dan kontrol tahun pelajaran aktif sistem.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SchoolProfileForm initialData={profile} />
          <AcademicYearTable data={years} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AcademicYearForm />
          </div>
        </div>
      </div>
    </div>
  )
}