import { fetchAdminNews } from "../../../actions/newsAction"
import AdminNewsClient from "@/components/admin/admin-news-client"

export const dynamic = "force-dynamic"

export default async function AdminBeritaPage() {
  const result = await fetchAdminNews()
  const newsData = result.success ? result.data : []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Kelola Berita</h1>
        <p className="text-slate-600">Tulis, edit, dan publikasikan artikel berita terbaru untuk Halaman Utama website.</p>
      </div>

      <AdminNewsClient initialData={newsData} />
    </div>
  )
}