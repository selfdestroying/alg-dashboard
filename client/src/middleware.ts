import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// const protectedRoutes = ['/dashboard']
const PUBLIC_ROUTES = ['/', '/auth']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (PUBLIC_ROUTES.includes(path)) return NextResponse.next()

  const token = (await cookies()).get('session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
