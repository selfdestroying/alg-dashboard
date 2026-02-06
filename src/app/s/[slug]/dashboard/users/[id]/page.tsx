import { getPaychecks } from '@/src/actions/paycheck'
import { getUser } from '@/src/actions/users'
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
import { getFullName } from '@/src/lib/utils'
import EditUserButton from '../_components/edit-user-dialog'
import AddCheckButton from './_components/add-check-button'
import PayChecksTable from './_components/paycheks-table'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser({
    where: {
      id: +id,
    },
    include: {
      role: true,
    },
  })

  if (!user) {
    return <div>Пользователь не найден.</div>
  }

  const paychecks = await getPaychecks({
    where: {
      userId: user.id,
    },
    orderBy: { date: 'asc' },
  })
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {user.firstName?.[0]?.toUpperCase()}
                  {user.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {getFullName(user.firstName, user.lastName)}
            </div>
          </CardTitle>
          <CardDescription>
            <span>{user.role.name}</span>
            {' • '}
            <span className={user.status === 'ACTIVE' ? 'text-success' : 'text-destructive'}>
              {user.status == 'ACTIVE' ? 'Активен' : 'Неактивен'}
            </span>
          </CardDescription>
          <CardAction>
            <EditUserButton user={user} />
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <div>
              <div className="text-muted-foreground">Ставка за урок</div>
              <div className="text-sm font-bold">
                {user.bidForLesson ? user.bidForLesson.toLocaleString() : '-'} ₽
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Ставка за индив.</div>
              <div className="text-sm font-bold">
                {user.bidForIndividual ? user.bidForIndividual.toLocaleString() : '-'} ₽
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
            <AddCheckButton user={user} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            <PayChecksTable data={paychecks} user={user} />
          </ItemGroup>
        </CardContent>
      </Card>
    </>
  )
}
