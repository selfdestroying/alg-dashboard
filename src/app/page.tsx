import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '../lib/auth'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  return (
    <div className="flex gap-2">
      {session ? (
        session.members.length !== 0 ? (
          <Link
            href={`${`${protocol}://${session.members[0].organization.slug}.${rootDomain}`}`}
            className="text-primary hover:underline"
          >
            В школу
          </Link>
        ) : (
          <div>No organization</div>
        )
      ) : (
        <Link
          href={`${`${protocol}://auth.${rootDomain}/sign-in`}`}
          className="text-primary hover:underline"
        >
          Sign In
        </Link>
      )}
    </div>
  )
}
