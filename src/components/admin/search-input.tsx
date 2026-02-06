'use client'

import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  
  // State lokal untuk menyimpan apa yang sedang diketik user
  const [text, setText] = useState(searchParams.get('q')?.toString() || "")

  // EFEK AJAIB (DEBOUNCE)
  // Kode ini akan jalan otomatis setiap kali 'text' berubah
  useEffect(() => {
    // 1. Pasang timer tunda selama 500ms (setengah detik)
    const timer = setTimeout(() => {
      
      // Ambil query yang ada di URL sekarang
      const currentQuery = searchParams.get('q')?.toString() || ""

      // Hanya update URL jika teks memang berubah (biar gak refresh sendiri)
      if (text !== currentQuery) {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1') // Selalu reset ke halaman 1 saat cari baru

        if (text) {
          params.set('q', text)
        } else {
          params.delete('q') // Hapus param q kalau kosong
        }

        // Update URL Otomatis!
        replace(`?${params.toString()}`)
      }
      
    }, 500) // <--- WAKTU TUNDA (Bisa diatur, 500ms itu pas)

    // 2. Kalau user mengetik lagi sebelum 0.5 detik, batalkan timer sebelumnya
    // (Ini yang bikin aplikasi tetap ringan walau user ngetik cepat)
    return () => clearTimeout(timer)
  }, [text, searchParams, replace])

  return (
    <div className="relative w-full md:w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
      
      <input
        className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        placeholder={placeholder}
        value={text}
        // Saat ngetik, kita cuma update state 'text'.
        // Biarkan useEffect di atas yang mengurus pencariannya.
        onChange={(e) => setText(e.target.value)} 
      />

      {/* Tombol X (Clear) */}
      {text && (
        <button
          onClick={() => setText("")} // Klik silang -> Text kosong -> Otomatis reset tabel
          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}