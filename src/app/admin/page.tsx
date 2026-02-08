import { auth } from '@/src/lib/auth'
import prisma from '@/src/lib/prisma'
import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import ListOrganizations from './_components/list-organizations'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }

  const organizations = await prisma.organization.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  return <ListOrganizations organizations={organizations} users={users} />
}
