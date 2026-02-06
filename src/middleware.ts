import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ambil cookie sesi (kita simpan manual saat loginAction)
  const userId = request.cookies.get('userId')?.value
  const userRole = request.cookies.get('userRole')?.value
  
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // 1. Jika User ingin ke halaman Admin tapi bukan Admin
  if (pathname.startsWith('/admin')) {
    if (!userId || userRole !== 'ADMIN') {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // 2. Jika User ingin ke halaman Mentor tapi belum login
  // (Mentor atau Admin boleh masuk, atau spesifik Mentor saja, tergantung kebijakan)
  if (pathname.startsWith('/mentor')) {
    if (!userId || userRole !== 'MENTOR') {
       // Opsional: Admin boleh intip mentor? kalau ya, ubah jadi: userRole !== 'MENTOR' && userRole !== 'ADMIN'
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // 3. Jika User sudah login tapi buka halaman Login lagi -> lempar ke dashboard
  if (pathname === '/login' && userId) {
    if (userRole === 'ADMIN') {
      url.pathname = '/admin/dashboard'
    } else {
      url.pathname = '/mentor/dashboard'
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Tentukan rute mana saja yang dicek middleware
export const config = {
  matcher: ['/admin/:path*', '/mentor/:path*', '/login'],
}