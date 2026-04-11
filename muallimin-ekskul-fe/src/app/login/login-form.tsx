'use client'

import { useActionState } from "react"
import { loginAction } from "@/actions/authAction";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight } from "lucide-react"
export const dynamic = "force-dynamic"

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null)

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
           ⚠️ {state.error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-slate-600">Username</Label>
          <Input 
            id="username" 
            name="username" 
            placeholder="Masukkan username anda" 
            required 
            className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all" 
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-600">Password</Label>
          </div>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all" 
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]" 
        disabled={isPending}
      >
        {isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
        ) : (
          <>Masuk Dashboard <ArrowRight className="ml-2 h-4 w-4" /></>
        )}
      </Button>
    </form>
  )
}