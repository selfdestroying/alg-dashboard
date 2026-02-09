import { auth } from '@/src/lib/auth'
import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  const redirectURL = session
    ? `${protocol}://${session.members[0].organization.slug}.${rootDomain}`
    : '/sign-in'

  return redirect(redirectURL)
}
