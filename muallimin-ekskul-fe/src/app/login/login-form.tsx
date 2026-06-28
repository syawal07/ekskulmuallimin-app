'use client'

import { useState, useActionState } from "react"
import { loginAction } from "@/actions/authAction";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="p-4 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
           <span className="text-lg">⚠️</span> {state.error}
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-slate-700 font-bold">Username</Label>
          <Input 
            id="username" 
            name="username" 
            placeholder="Masukkan username Anda" 
            required 
            className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all font-medium placeholder:text-slate-400" 
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-700 font-bold">Password</Label>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              required 
              className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all font-medium placeholder:text-slate-400 pr-10" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-2" 
        disabled={isPending}
      >
        {isPending ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...</>
        ) : (
          <>Masuk Sistem <ArrowRight className="ml-2 h-4 w-4" /></>
        )}
      </Button>
    </form>
  )
}