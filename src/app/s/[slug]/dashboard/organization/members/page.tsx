import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { auth } from '@/src/lib/auth'
import { withRLS } from '@/src/lib/rls'
import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import CreateUserDialog from './_components/create-user-dialog'
import UsersTable from './_components/users-table'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }
  const orgId = session.members[0].organizationId
  const members = await withRLS(orgId, (tx) =>
    tx.member.findMany({
      where: {
        organizationId: orgId,
        NOT: { userId: Number(session.user.id) },
      },
      include: {
        user: true,
      },
    })
  )

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
          <CardDescription>Список всех пользователей системы</CardDescription>
          <CardAction>
            <CreateUserDialog />
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <UsersTable data={members} />
        </CardContent>
      </Card>
    </div>
  )
}
