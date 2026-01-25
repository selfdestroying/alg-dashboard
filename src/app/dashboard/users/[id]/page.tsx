import { getPaychecks } from '@/actions/paycheck'
import { getUser } from '@/actions/users'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { getFullName } from '@/lib/utils'
import { toZonedTime } from 'date-fns-tz'
import EditUserButton from '../_components/edit-user-dialog'
import AddCheckButton from './add-check-button'

const userRoleMap = {
  ADMIN: 'Админ',
  OWNER: 'Владелец',
  TEACHER: 'Учитель',
  MANAGER: 'Менеджер',
}

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
                {user.bidForLesson ? user.bidForLesson.toLocaleString() : '—'} ₽
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Ставка за индив.</div>
              <div className="text-sm font-bold">
                {user.bidForIndividual ? user.bidForIndividual.toLocaleString() : '—'} ₽
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
            {paychecks.map((paycheck) => (
              <Item key={paycheck.id} variant={'muted'} size={'sm'}>
                <ItemContent>
                  <ItemTitle>Чек #{paycheck.id}</ItemTitle>
                  <ItemDescription>{paycheck.comment}</ItemDescription>
                </ItemContent>
                <ItemFooter>
                  <span>
                    {toZonedTime(paycheck.createdAt, 'Europe/Moscow').toLocaleDateString('ru-RU')}
                  </span>
                  <span className="font-bold">{paycheck.amount.toLocaleString()} ₽</span>
                </ItemFooter>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
    </>
  )
}
