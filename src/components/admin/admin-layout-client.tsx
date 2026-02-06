'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  LogOut, 
  User, 
  Users, 
  School, 
  Trophy, 
  Menu, 
  X,
  ClipboardCheck,
  ChevronRight,
  Image as ImageIcon,
  type LucideIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"
// Import Server Action Logout
import { logoutAction } from "@/actions/authAction"

type AdminUser = {
  name: string | null
  username: string | null
}

// Komponen Menu Item (Di luar component utama biar performa cepat)
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
        ? "bg-primary/5 text-primary font-bold shadow-sm border border-primary/10" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
      <span>{label}</span>
    </div>
    {isActive && <ChevronRight className="w-4 h-4 text-primary/50" />}
  </Link>
)

export default function AdminLayoutClient({
  children,
  admin
}: {
  children: React.ReactNode
  admin: AdminUser
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isPathActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-100 shadow-xl shadow-slate-200/50 transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
              A
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">Admin Panel</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu List */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Main Menu</p>
          
          <MenuItem 
            href="/admin/dashboard" 
            icon={LayoutDashboard} 
            label="Dashboard" 
            isActive={isPathActive("/admin/dashboard")}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-3 mt-8 tracking-wider">Master Data</p>
          
          <MenuItem 
            href="/admin/guru" 
            icon={User} 
            label="Data Guru" 
            isActive={isPathActive("/admin/guru")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <MenuItem 
            href="/admin/siswa" 
            icon={Users} 
            label="Data Siswa" 
            isActive={isPathActive("/admin/siswa")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <MenuItem 
            href="/admin/ekskul" 
            icon={Trophy} 
            label="Data Ekskul" 
            isActive={isPathActive("/admin/ekskul")}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <MenuItem 
            href="/admin/presensi" 
            icon={ClipboardCheck} 
            label="Monitoring Presensi" 
            isActive={isPathActive("/admin/presensi")}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-3 mt-8 tracking-wider">Pengaturan</p>
          
          <MenuItem 
            href="/admin/sekolah"              
            icon={School} 
            label="Profil Sekolah" 
            isActive={isPathActive("/admin/sekolah")} 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <MenuItem 
            href="/admin/galeri"              
            icon={ImageIcon} 
            label="Galeri Kegiatan" 
            isActive={isPathActive("/admin/galeri")} 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Footer Profil */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50 m-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-primary shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{admin.name}</p>
              <p className="text-xs text-slate-500 truncate">@{admin.username}</p>
            </div>
          </div>
          
          {/* TOMBOL LOGOUT YANG BENAR (Langsung panggil Server Action) */}
          <button 
             onClick={() => logoutAction()}
             className="w-full h-9 flex items-center justify-center gap-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-md shadow-md shadow-red-500/20 transition-all active:scale-95"
           >
             <LogOut className="w-3 h-3" /> Keluar Sistem
           </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Mobile */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex md:hidden items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-slate-700" />
            </Button>
            <span className="font-bold text-slate-800">Admin Panel</span>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
            A
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}