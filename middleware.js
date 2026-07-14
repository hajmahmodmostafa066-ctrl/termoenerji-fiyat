import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Oturumu kontrol et
  const { data: { session } } = await supabase.auth.getSession()

  // Eğer oturum yoksa ve login sayfasında değilse login'e yönlendir
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = new URL('/login', req.url)
    // Gitmek istediği sayfayı parametre olarak ekle
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Eğer oturum varsa ve login sayfasındaysa ana sayfaya yönlendir
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/panel', req.url))
  }

  // Kullanıcı rolünü kontrol et (admin/yönetici/kullanıcı)
  if (session && req.nextUrl.pathname.startsWith('/panel/kullanıcilar')) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single()

    const role = userData?.role || 'kullanici'
    
    // Sadece admin ve yönetici görebilir
    if (role !== 'admin' && role !== 'yonetici') {
      return NextResponse.redirect(new URL('/panel', req.url))
    }
  }

  return res
}

// Middleware'in çalışacağı yollar
export const config = {
  matcher: [
    '/panel/:path*',
    '/login',
    '/'
  ]
}
