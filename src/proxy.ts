import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from './lib/session'

export default async function proxy(req: NextRequest) {
  console.log('Middleware invoked for:', req.nextUrl.pathname)
  const path = req.nextUrl.pathname

  const { isAuth } = await verifySession()

  if (isAuth && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  if (!isAuth && path !== '/login') {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/dashboard/:path*'],
}
