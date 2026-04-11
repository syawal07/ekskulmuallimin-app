'use client'

import { deleteGalleryImage } from "@/actions/galleryAction"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

type GalleryProps = {
  id: string
  title: string
  imageUrl: string
  date: Date
}

export default function GalleryCard({ item }: { item: GalleryProps }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if(!confirm("Yakin ingin menghapus foto ini?")) return

    setDeleting(true)
    const res = await deleteGalleryImage(item.id)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Foto dihapus.")
    }
    setDeleting(false)
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
      <div className="aspect-video relative bg-slate-100">
        <Image 
          src={item.imageUrl} 
          alt={item.title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete} 
            disabled={deleting}
            className="rounded-full"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Hapus
          </Button>
        </div>
      </div>

      <div className="p-3">
        <h4 className="font-semibold text-slate-800 text-sm truncate" title={item.title}>
          {item.title}
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          {new Date(item.date).toLocaleDateString("id-ID", {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}