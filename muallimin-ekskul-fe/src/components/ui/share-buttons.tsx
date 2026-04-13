'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link2, Check, MessageCircle, Facebook } from "lucide-react"
import { toast } from "sonner"

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    // Tangkap URL langsung saat tombol diklik
    const currentUrl = window.location.href
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    toast.success("Tautan berita berhasil disalin!")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const currentUrl = window.location.href
    window.open(`https://wa.me/?text=${encodeURIComponent(title + " - Baca selengkapnya di: " + currentUrl)}`, '_blank')
  }

  const shareFacebook = () => {
    const currentUrl = window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank')
  }

  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8">
      <span className="text-sm font-bold text-slate-500 mr-2">Bagikan:</span>
      <Button 
        onClick={copyLink} 
        variant="outline" 
        className="rounded-full bg-white shadow-sm border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all"
      >
        {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Link2 className="w-4 h-4 mr-2" />}
        {copied ? "Tersalin!" : "Salin Tautan"}
      </Button>
      <Button 
        onClick={shareWhatsApp} 
        variant="outline" 
        className="rounded-full bg-white shadow-sm border-slate-200 hover:border-green-500 hover:text-green-600 transition-all"
      >
        <MessageCircle className="w-4 h-4 mr-2 text-green-500" /> WhatsApp
      </Button>
      <Button 
        onClick={shareFacebook} 
        variant="outline" 
        className="rounded-full bg-white shadow-sm border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all"
      >
        <Facebook className="w-4 h-4 mr-2 text-blue-500" /> Facebook
      </Button>
    </div>
  )
}