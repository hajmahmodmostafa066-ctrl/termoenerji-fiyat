import { NextResponse } from 'next/server'

export async function middleware(req) {
  // Basit oturum kontrolü için cookie'yi kontrol et
  const sessionCookie = req.cookies.get('sb-access-token')
  
  // Login sayfası kontrolü
  const isLoginPage = req.nextUrl.pathname.startsWith('/login')
  
  // Oturum yoksa ve login sayfasında değilse yönlendir
  if (!sessionCookie && !isLoginPage) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Oturum varsa ve login sayfasındaysa panele yönlendir
  if (sessionCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/panel', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/panel/:path*',
    '/login',
    '/'
  ]
}
