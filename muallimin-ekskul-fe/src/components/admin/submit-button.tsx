'use client'

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

export default function SubmitButton({ children }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="min-w-[140px] bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-500/20 transition-all"
    >
      {pending ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
      ) : (
        children || <><Save className="w-4 h-4 mr-2" /> Simpan Data</>
      )}
    </Button>
  )
}