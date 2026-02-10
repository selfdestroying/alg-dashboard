import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { ItemGroup } from '@/src/components/ui/item'
import { auth } from '@/src/lib/auth'
import { withRLS } from '@/src/lib/rls'
import { protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AddCheckButton from '../dashboard/users/[id]/_components/add-check-button'
import PayChecksTable from '../dashboard/users/[id]/_components/paycheks-table'
import UserCard from './_components/user-card'

export default async function Page() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }
  const activeSessions = await auth.api.listSessions({
    headers: requestHeaders,
  })

  const orgId = session.members[0].organizationId
  const paychecks = await withRLS(orgId, (tx) =>
    tx.payCheck.findMany({
      where: {
        userId: Number(session.user.id),
        organizationId: orgId,
      },
    })
  )
  return (
    <div className="space-y-2">
      <UserCard session={session} activeSessions={activeSessions} />
      <Card>
        <CardHeader>
          <CardTitle>Чеки</CardTitle>
          <CardDescription>
            <span>Всего чеков: {paychecks.length}</span>
            {' • '}
            <span>
              Сумма:{' '}
              {paychecks.reduce((acc, paycheck) => acc + paycheck.amount, 0).toLocaleString()} ₽
            </span>
          </CardDescription>
          <CardAction>
            <AddCheckButton
              organizationId={orgId}
              userId={Number(session.user.id)}
              userName={session.user.name}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            <PayChecksTable data={paychecks} userName={session.user.name} />
          </ItemGroup>
        </CardContent>
      </Card>
    </div>
  )
}
