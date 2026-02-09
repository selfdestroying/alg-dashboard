import { auth } from '@/src/lib/auth'
import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SignIn from './_components/sign-in'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  if (session)
    return redirect(`${protocol}://${session.members[0].organization.slug}.${rootDomain}`)

  return <SignIn />
}
