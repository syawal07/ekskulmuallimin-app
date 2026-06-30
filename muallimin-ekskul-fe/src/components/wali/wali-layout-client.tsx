"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, Menu, X, User } from "lucide-react"
import { logoutAction } from "@/actions/authAction"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export interface ProfileData {
  logo_url?: string | null;
  school_name?: string;
  [key: string]: unknown;
}

const navItems = [
  { name: "Dashboard Wali", href: "/wali/dashboard", icon: LayoutDashboard },
]

function SidebarContent({
  pathname,
  setIsMobileMenuOpen,
  user,
  profile
}: {
  pathname: string
  setIsMobileMenuOpen: (val: boolean) => void
  user: { name: string; username: string }
  profile?: ProfileData
}) {
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL?.replace('/api', '') || ''
  const logoUrlFromDb = profile?.logo_url ? `${backendUrl}/storage/${profile.logo_url}` : "/logo.png"

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-700">
      <div className="h-24 flex items-center px-6 border-b border-white/40 shrink-0">
        <div className="flex items-center gap-4 w-full">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-[2px] rounded-2xl shadow-lg shadow-blue-500/20 shrink-0">
            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-[14px] flex items-center justify-center w-10 h-10">
              <Image 
                src={logoUrlFromDb} 
                alt="Logo" 
                width={32} 
                height={32} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-lg text-slate-800 tracking-tight truncate">Rapor Kesiswaan</h2>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest truncate">Portal Wali</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-5 space-y-2 scrollbar-hide">
        <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menu Utama</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group ${
                isActive
                  ? "bg-white/60 text-blue-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 backdrop-blur-md"
                  : "text-slate-500 hover:bg-white/40 hover:text-slate-800 hover:shadow-sm border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-5 shrink-0">
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-white to-slate-100 flex items-center justify-center text-blue-600 border border-white shadow-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs font-medium text-slate-500 truncate">@{user.username}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button 
              type="submit" 
              variant="ghost" 
              className="w-full justify-center gap-2 bg-red-50/50 hover:bg-red-500 hover:text-white text-red-600 border border-red-100/50 rounded-2xl h-11 font-bold transition-all duration-300 shadow-sm hover:shadow-red-500/25"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function WaliLayoutClient({
  children,
  user,
  profile
}: {
  children: React.ReactNode
  user: { name: string; username: string }
  profile?: ProfileData
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 bg-slate-50 relative overflow-hidden">
      
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-[40%] right-[10%] w-[20%] h-[20%] bg-amber-100/30 rounded-full blur-[100px] pointer-events-none"></div>

      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-20 bg-white/40 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent 
          pathname={pathname} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          user={user} 
          profile={profile}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:pl-72 transition-all duration-300 ease-in-out relative z-10">
        
        <header className="md:hidden bg-white/60 backdrop-blur-xl border-b border-white/50 sticky top-0 z-30 flex items-center justify-between px-5 h-16 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1.5px] rounded-lg shadow-sm">
              <div className="bg-white/90 p-1 rounded-[6px] flex items-center justify-center">
                <Image 
                  src={profile?.logo_url ? `${process.env.NEXT_PUBLIC_API_BACKEND_URL?.replace('/api', '')}/storage/${profile.logo_url}` : "/logo.png"} 
                  alt="Logo" 
                  width={20} 
                  height={20} 
                  className="object-contain"
                />
              </div>
            </div>
            <span className="font-extrabold text-lg text-slate-800 tracking-tight">Kesiswaan</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="text-slate-600 hover:text-blue-700 p-2 focus:outline-none bg-white/50 hover:bg-white/80 rounded-xl transition-all duration-300 border border-white/60 shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white/70 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-left duration-500 ease-out border-r border-white/50">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 -right-14 text-slate-700 bg-white/50 hover:bg-white/80 p-2.5 rounded-full backdrop-blur-md transition-all border border-white/60 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent 
              pathname={pathname} 
              setIsMobileMenuOpen={setIsMobileMenuOpen} 
              user={user} 
              profile={profile}
            />
          </div>
        </div>
      )}
    </div>
  )
}