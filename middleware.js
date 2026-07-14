import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  
  // Supabase istemcisini oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  // Oturumu kontrol et
  const { data: { session } } = await supabase.auth.getSession()

  // Eğer oturum yoksa ve login sayfasında değilse login'e yönlendir
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Eğer oturum varsa ve login sayfasındaysa ana sayfaya yönlendir
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/panel', req.url))
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
