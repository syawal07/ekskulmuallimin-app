"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, Menu, X, User, Activity } from "lucide-react"
import { logoutAction } from "@/actions/authAction"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Dashboard Wali", href: "/wali/dashboard", icon: LayoutDashboard },
]

function SidebarContent({
  pathname,
  setIsMobileMenuOpen,
  user
}: {
  pathname: string
  setIsMobileMenuOpen: (val: boolean) => void
  user: { name: string; username: string }
}) {
  return (
    <>
      <div className="h-20 flex items-center px-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm">
            <Activity className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <span className="font-black text-xl text-white tracking-tight">EkskulMuallimin</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-white/10 text-white shadow-inner border border-white/5"
                  : "text-blue-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-5 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="h-11 w-11 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-100 border border-blue-400/30 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs font-medium text-blue-300 truncate">Wali Santri ({user.username})</p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button 
            type="submit" 
            variant="destructive" 
            className="w-full justify-center gap-2 bg-red-500/80 hover:bg-red-500 text-white border-0 rounded-xl h-12 font-bold shadow-lg shadow-red-900/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sistem
          </Button>
        </form>
      </div>
    </>
  )
}

export default function WaliLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode
  user: { name: string; username: string }
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      <aside className="hidden md:flex w-72 flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 shadow-2xl z-20">
        <SidebarContent 
          pathname={pathname} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          user={user} 
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 h-16 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-700 p-1.5 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg text-slate-800 tracking-tight">Ekskul App</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="text-slate-600 hover:text-blue-700 p-2 focus:outline-none bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 shadow-2xl animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-5 right-5 text-blue-200 hover:text-white bg-white/10 p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent 
              pathname={pathname} 
              setIsMobileMenuOpen={setIsMobileMenuOpen} 
              user={user} 
            />
          </div>
        </div>
      )}

    </div>
  )
}