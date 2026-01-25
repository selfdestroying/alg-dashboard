import { getPaychecks } from '@/actions/paycheck'
import { getUser } from '@/actions/users'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { toZonedTime } from 'date-fns-tz'
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
        <CardHeader className="flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary text-primary-foreground rounded-full text-xl font-bold">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-bold">
              <div className="flex items-center gap-2 text-left">
                <span className="truncate font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <Badge variant={'outline'}>{user.role.name}</Badge>
                <Badge>{user.status == 'ACTIVE' ? 'Активен' : 'Неактивен'}</Badge>
              </div>
            </CardTitle>
          </div>
          <CardAction>
            {/* <FormDialog
              title="Редактировать пользователя"
              icon="edit"
              FormComponent={EditUserForm}
              formComponentProps={{ user }}
              submitButtonProps={{ form: 'user-form' }}
              triggerButtonProps={{ variant: 'outline', size: 'sm' }}
            /> */}
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center gap-2">
            <div>
              <div className="text-muted-foreground text-sm">Ставка за урок</div>
              <div className="text-lg font-bold">
                {user.bidForLesson ? user.bidForLesson.toLocaleString() : '—'} ₽
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Ставка за индив.</div>
              <div className="text-lg font-bold">
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
