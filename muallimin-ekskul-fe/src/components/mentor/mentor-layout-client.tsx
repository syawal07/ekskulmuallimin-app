'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  ClipboardList, 
  History, 
  LogOut, 
  Menu, 
  X, 
  User,
  ChevronRight,
  Loader2,
  GraduationCap,
  type LucideIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/actions/authAction"

type MentorUser = {
  name: string | null
  username: string | null
}

const MenuItem = ({ 
  href, 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  href: string
  icon: LucideIcon
  label: string
  isActive: boolean
  onClick: () => void
}) => (
  <Link 
    href={href} 
    onClick={onClick}
    className={cn(
      "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
      isActive
        ? "bg-green-50 text-green-700 font-bold shadow-sm border border-green-100" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon className={cn("w-5 h-5", isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600")} />
      <span>{label}</span>
    </div>
    {isActive && <ChevronRight className="w-4 h-4 text-green-600/50" />}
  </Link>
)

export default function MentorLayoutClient({
  children,
  user
}: {
  children: React.ReactNode
  user: MentorUser
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const isPathActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  const handleLogout = () => {
    startTransition(() => {
      logoutAction()
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-100 shadow-xl shadow-slate-200/50 transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-green-600/20">
              M
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">Panel Pengajar</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">MENTOR AREA</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Menu Utama</p>
          
          <MenuItem 
            href="/mentor/dashboard" 
            icon={LayoutDashboard} 
            label="Dashboard" 
            isActive={isPathActive("/mentor/dashboard")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <MenuItem 
            href="/mentor/presensi" 
            icon={ClipboardList} 
            label="Input Presensi" 
            isActive={isPathActive("/mentor/presensi")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <MenuItem 
            href="/mentor/penilaian" 
            icon={GraduationCap} 
            label="Penilaian" 
            isActive={isPathActive("/mentor/penilaian")}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <MenuItem 
            href="/mentor/riwayat" 
            icon={History} 
            label="Riwayat" 
            isActive={isPathActive("/mentor/riwayat")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <MenuItem 
            href="/mentor/rekap" 
            icon={History} 
            label="Rekapan Kehadiran" 
            isActive={isPathActive("/mentor/rekap")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50 m-4 rounded-2xl shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-green-600 shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">@{user.username}</p>
            </div>
          </div>
          
          <button 
             onClick={handleLogout}
             disabled={isPending}
             className="w-full h-9 flex items-center justify-center gap-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
             {isPending ? "Keluar..." : "Keluar"}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex md:hidden items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-slate-700" />
            </Button>
            <span className="font-bold text-slate-800">Panel Pengajar</span>
          </div>
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
            M
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}