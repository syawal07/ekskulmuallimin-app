'use client'

import { useTransition } from "react"
import { setActiveAcademicYear, deleteAcademicYear } from "@/actions/academicYearAction"
import { toast } from "sonner"

interface AcademicYear {
  id: number
  name: string
  semester: string
  is_active: boolean
}

interface AcademicYearTableProps {
  data: AcademicYear[]
}

export function AcademicYearTable({ data }: AcademicYearTableProps) {
  const [isPending, startTransition] = useTransition()

  function handleSetActive(id: number) {
    startTransition(async () => {
      const res = await setActiveAcademicYear(id)
      if (res?.success) {
        toast.success("Tahun pelajaran aktif berhasil diperbarui")
      } else {
        toast.error(res?.error || "Gagal memperbarui status")
      }
    })
  }

  function handleDelete(id: number) {
    if (confirm("Apakah Anda yakin ingin menghapus tahun pelajaran ini?")) {
      startTransition(async () => {
        const res = await deleteAcademicYear(id)
        if (res?.success) {
          toast.success("Tahun pelajaran berhasil dihapus")
        } else {
          toast.error(res?.error || "Gagal menghapus data")
        }
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Daftar Tahun Pelajaran</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Tahun Pelajaran</th>
              <th className="px-6 py-3">Semester</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                <td className="px-6 py-4">{item.semester}</td>
                <td className="px-6 py-4">
                  {item.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      Aktif Berjalan
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                      Histori
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {!item.is_active && (
                    <button
                      disabled={isPending}
                      onClick={() => handleSetActive(item.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      Set Aktif
                    </button>
                  )}
                  {!item.is_active && (
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}