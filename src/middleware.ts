import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from './lib/session'

const PUBLIC_ROUTES = ['/', '/auth']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Проверяем сессию на каждый запрос
  const { isAuth } = await verifySession()
  // Если пользователь аутентифицирован и пытается зайти на публичные маршруты (например, /auth),
  // перенаправляем его на /dashboard
  if (isAuth && PUBLIC_ROUTES.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Если маршрут является публичным и пользователь не аутентифицирован,
  // разрешаем доступ
  if (PUBLIC_ROUTES.includes(path)) {
    return NextResponse.next()
  }

  // Если маршрут защищен и пользователь не аутентифицирован,
  // перенаправляем его на /auth
  if (!isAuth) {
    return NextResponse.redirect(new URL('/auth', req.nextUrl))
  }

  // Если пользователь аутентифицирован и маршрут не публичный,
  // разрешаем доступ
  return NextResponse.next()
}

export const config = {
  // matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'], // Ваш текущий matcher
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
