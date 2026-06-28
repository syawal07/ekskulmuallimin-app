'use client'

import { useTransition } from "react"
import { deletePerkaderan } from "@/actions/perkaderanAction"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import PerkaderanModal, { Perkaderan } from "./perkaderan-modal"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default function AdminPerkaderanClient({ data }: { data: Perkaderan[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus jenjang perkaderan ini?")) {
      startTransition(async () => {
        const res = await deletePerkaderan(id)
        if (res?.success) {
          toast.success("Jenjang berhasil dihapus")
          router.refresh()
        } else {
          toast.error(res?.error || "Gagal menghapus jenjang")
        }
      })
    }
  }

  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case "Wajib":
        return "bg-red-100 text-red-700 border-red-200"
      case "Pendukung Utama":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Pendukung Khusus":
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Nama Jenjang</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Target Kelas</th>
              <th className="px-6 py-4">Deskripsi</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data perkaderan
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{item.nama_jenjang}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getKategoriBadge(item.kategori)}`}>
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {item.target_kelas === "Semua Kelas" ? "Semua Kelas" : `Kelas ${item.target_kelas}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.deskripsi || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PerkaderanModal initialData={item} />
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}