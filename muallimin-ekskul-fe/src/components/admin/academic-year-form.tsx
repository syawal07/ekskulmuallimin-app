'use client'

import { createAcademicYear } from "@/actions/academicYearAction"
import SubmitButton from "./submit-button"
import { toast } from "sonner"
import { useRef } from "react"

interface AcademicYearFormProps {
  onSuccess?: () => void
}

export function AcademicYearForm({ onSuccess }: AcademicYearFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  async function clientAction(formData: FormData) {
    const result = await createAcademicYear(null, formData)
    if (result?.success) {
      toast.success("Tahun Pelajaran berhasil ditambahkan")
      formRef.current?.reset()
      if (onSuccess) onSuccess()
    } else {
      toast.error(result?.error || "Gagal menyimpan data")
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tambah Tahun Pelajaran</h3>
      <form ref={formRef} action={clientAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tahun Pelajaran
          </label>
          <input
            type="text"
            name="name"
            placeholder="Contoh: 2026/2027"
            required
            pattern="\d{4}/\d{4}"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Format wajib: YYYY/YYYY (misal 2026/2027)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
          <select
            name="semester"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>

        <SubmitButton>Simpan Tahun Pelajaran</SubmitButton>
      </form>
    </div>
  )
}