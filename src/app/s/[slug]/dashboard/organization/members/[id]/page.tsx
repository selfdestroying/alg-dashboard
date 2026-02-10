import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { ItemGroup } from '@/src/components/ui/item'
import { auth, OrganizationRole } from '@/src/lib/auth'
import { withRLS } from '@/src/lib/rls'
import { getFullName, protocol, rootDomain } from '@/src/lib/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AddCheckButton from '../../../users/[id]/_components/add-check-button'
import PayChecksTable from '../../../users/[id]/_components/paycheks-table'
import EditUserButton from '../_components/edit-user-dialog'

const memberRoleLabels = {
  owner: 'Владелец',
  manager: 'Менеджер',
  teacher: 'Учитель',
} as const satisfies Record<OrganizationRole, string>

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })
  if (!session) {
    redirect(`${protocol}://auth.${rootDomain}/sign-in`)
  }

  const { id } = await params
  const orgId = session.members[0].organizationId
  const { member, paychecks } = await withRLS(orgId, async (tx) => {
    const member = await tx.member.findFirst({
      where: {
        id: Number(id),
        organizationId: orgId,
      },
      include: {
        user: true,
      },
    })

    const paychecks = member
      ? await tx.payCheck.findMany({
          where: {
            userId: member.userId,
            organizationId: orgId,
          },
          orderBy: { date: 'asc' },
        })
      : []

    return { member, paychecks }
  })

  if (!member) {
    return <div>Сотрудник не найден.</div>
  }

  const roleLabel = memberRoleLabels[member.role as OrganizationRole] ?? member.role ?? '-'
  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {member.user.firstName?.[0]?.toUpperCase()}
                  {member.user.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {getFullName(member.user.firstName, member.user.lastName)}
            </div>
          </CardTitle>
          <CardDescription>
            <span>{roleLabel}</span>
            {' • '}
            <span className={!member.user.banned ? 'text-success' : 'text-destructive'}>
              {!member.user.banned ? 'Активен' : 'Неактивен'}
            </span>
          </CardDescription>
          <CardAction>
            <EditUserButton member={member} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div>
              <div className="text-muted-foreground">Ставка за урок</div>
              <div className="text-sm font-bold">
                {member.user.bidForLesson ? member.user.bidForLesson.toLocaleString() : '-'} ₽
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Ставка за индив.</div>
              <div className="text-sm font-bold">
                {member.user.bidForIndividual ? member.user.bidForIndividual.toLocaleString() : '-'}{' '}
                ₽
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
              userId={member.userId}
              userName={member.user.name}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            <PayChecksTable data={paychecks} userName={member.user.name} />
          </ItemGroup>
        </CardContent>
      </Card>
    </div>
  )
}
