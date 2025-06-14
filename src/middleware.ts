import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// const protectedRoutes = ['/dashboard']
const publicRoutes = ['/auth']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  //   const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  const token = (await cookies()).get('session')?.value
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/auth', req.nextUrl))
  }
  const session = jwt.decode(token as string)
  if (session && !path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
