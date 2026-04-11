import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // FIX: Ambil cookie sesuai dengan yang kita set di src/lib/session.ts
  const token = request.cookies.get('session_token')?.value
  const userRole = request.cookies.get('user_role')?.value
  
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // 1. Jika User ingin ke halaman Admin tapi bukan Admin
  if (pathname.startsWith('/admin')) {
    if (!token || userRole !== 'ADMIN') {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // 2. Jika User ingin ke halaman Mentor tapi belum login
  if (pathname.startsWith('/mentor')) {
    if (!token || userRole !== 'MENTOR') {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // 3. Jika User sudah login tapi buka halaman Login lagi -> lempar ke dashboard
  if (pathname === '/login' && token) {
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