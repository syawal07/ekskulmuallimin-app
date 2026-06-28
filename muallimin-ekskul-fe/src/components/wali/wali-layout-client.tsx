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
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL?.replace('/api', '') || '';
  const logoUrlFromDb = profile?.logo_url ? `${backendUrl}/storage/${profile.logo_url}` : "/logo.png";

  return (
    <div className="flex flex-col h-full bg-white text-slate-600">
      <div className="h-20 flex items-center px-6 border-b border-slate-50 shrink-0">
        <div className="flex items-center gap-3 w-full">
          <div className="bg-blue-600 p-0.5 rounded-xl shadow-sm shrink-0">
            <div className="bg-white p-1.5 rounded-[10px] flex items-center justify-center w-9 h-9">
              <Image 
                src={logoUrlFromDb} 
                alt="Logo" 
                width={28} 
                height={28} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-slate-900 tracking-tight truncate">EkskulMuallimin</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Portal Wali</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Menu Utama</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 shrink-0">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 border border-slate-200 shadow-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs font-medium text-slate-500 truncate">@{user.username}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button 
              type="submit" 
              variant="ghost" 
              className="w-full justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-100 rounded-xl h-10 font-bold transition-all"
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
    <div className="flex min-h-screen bg-slate-50/50 font-sans selection:bg-blue-200 selection:text-blue-900">
      
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-20 bg-white shadow-xl shadow-slate-200/40 border-r border-slate-100">
        <SidebarContent 
          pathname={pathname} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          user={user} 
          profile={profile}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:pl-72 transition-all duration-300 ease-in-out">
        
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-4 h-16 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Image 
                src={profile?.logo_url ? `${process.env.NEXT_PUBLIC_API_BACKEND_URL?.replace('/api', '')}/storage/${profile.logo_url}` : "/logo.png"} 
                alt="Logo" 
                width={20} 
                height={20} 
                className="object-contain"
              />
            </div>
            <span className="font-black text-lg text-slate-800 tracking-tight">Ekskul App</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="text-slate-500 hover:text-blue-700 p-2 focus:outline-none bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
          >
            <Menu className="w-6 h-6" />
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 -right-12 text-white/90 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
            >
              <X className="w-6 h-6" />
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