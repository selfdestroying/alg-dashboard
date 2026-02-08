import { auth } from '@/src/lib/auth'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { protocol, rootDomain } from './lib/utils'

function extractSubdomain(request: NextRequest): string | null {
  const url = request.headers.get('host') || ''
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0]
  // Local development environment
  if (url.includes('localhost')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/)

    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1]
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0]
    }

    return null
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0]

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---')
    return parts.length > 0 ? parts[0] : null
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`)

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const subdomain = extractSubdomain(request)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // no subdomain -> proceed normally
  if (!subdomain) return NextResponse.next()

  const rootDomainFormatted = rootDomain
  const reserved = new Set(['auth', 'admin', 'shop'])

  // Handle reserved subdomains
  if (reserved.has(subdomain)) {
    switch (subdomain) {
      case 'auth': {
        // rewrite to /auth routes in the app
        return NextResponse.rewrite(new URL(`/auth${pathname}`, request.url))
      }
      case 'admin': {
        if (!session) {
          const authHost = `auth.${rootDomainFormatted}`
          const returnTo = encodeURIComponent(request.nextUrl.href)
          const redirectUrl = `${protocol}://${authHost}/sign-in?returnTo=${returnTo}`
          return NextResponse.redirect(redirectUrl)
        }
        if (session.roles.includes('admin')) {
          return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url))
        }
        return NextResponse.redirect(`${protocol}://${rootDomainFormatted}`)
      }
      case 'shop': {
        return NextResponse.rewrite(new URL(`/shop${pathname}`, request.url))
      }
      default:
        return NextResponse.next()
    }
  }

  // Remaining subdomains are organization slugs
  const members = // session may store members either on root or under user
    session?.members.map((m) => m.organization.slug)

  // If not authenticated, redirect to auth subdomain (preserve return url)
  if (!session) {
    const authHost = `auth.${rootDomainFormatted}`
    const returnTo = encodeURIComponent(request.nextUrl.href)
    const redirectUrl = `${protocol}://${authHost}/sign-in?returnTo=${returnTo}`
    console.warn(
      `Unauthenticated request for subdomain "${subdomain}". Redirecting to ${redirectUrl}`
    )
    return NextResponse.redirect(redirectUrl)
  }
  // If user is authenticated but is not a member of this org -> block
  if (Array.isArray(members) && !members.includes(subdomain)) {
    const redirectRoot = `${protocol}://${rootDomainFormatted}`
    console.warn(
      `Authenticated request for subdomain "${subdomain}" but user is not a member. Redirecting to ${redirectRoot}`
    )
    return NextResponse.redirect(redirectRoot)
  }

  // Authorized for this org: rewrite to org-scoped route and tag request
  const rewritten = NextResponse.rewrite(new URL(`/s/${subdomain}${pathname}`, request.url))
  rewritten.headers.set('x-organization', subdomain)
  return rewritten
}

export const config = {
  matcher: ['/((?!api|_next|[\\w-]+\\.\\w+).*)'],
}
