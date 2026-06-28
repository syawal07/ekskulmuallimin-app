import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value
  const userRole = request.cookies.get('user_role')?.value
  
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  if (pathname.startsWith('/admin')) {
    if (!token || userRole !== 'ADMIN') {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/mentor')) {
    // IZINKAN MENTOR DAN PEMBINA MASUK KE RUTE INI
    if (!token || (userRole !== 'MENTOR' && userRole !== 'PEMBINA')) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/wali')) {
    if (!token || userRole !== 'wali') {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  if (pathname === '/login' && token) {
    if (userRole === 'ADMIN') {
      url.pathname = '/admin/dashboard'
    } else if (userRole === 'MENTOR' || userRole === 'PEMBINA') {
      // ARAHKAN PEMBINA KE DASHBOARD YANG SAMA DENGAN MENTOR
      url.pathname = '/mentor/dashboard'
    } else if (userRole === 'wali') {
      url.pathname = '/wali/dashboard'
    } else {
      url.pathname = '/'
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/mentor/:path*', '/wali/:path*', '/login'],
}