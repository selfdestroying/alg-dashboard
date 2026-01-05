import { getPaychecks } from '@/actions/paycheck'
import { getUserById } from '@/actions/users'
import EditUserForm from '@/app/dashboard/users/_components/edit-user-form'
import FormDialog from '@/components/button-dialog'
import PaycheckForm from '@/components/forms/paycheck-form'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, MessageSquare, RussianRuble } from 'lucide-react'

const userRoleMap = {
  ADMIN: 'Админ',
  OWNER: 'Владелец',
  TEACHER: 'Учитель',
  MANAGER: 'Менеджер',
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserById({
    where: {
      id: +id,
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
                <Badge variant={'outline'}>{userRoleMap[user.role]}</Badge>
                <Badge variant={user.status == 'ACTIVE' ? 'success' : 'error'}>{user.status == 'ACTIVE' ? 'Активен' : 'Неактивен'}</Badge>

              </div>
            </CardTitle>
          </div>
          <CardAction>
            <FormDialog
              title="Редактировать пользователя"
              icon="edit"
              FormComponent={EditUserForm}
              formComponentProps={{ user }}
              submitButtonProps={{ form: 'user-form' }}
              triggerButtonProps={{ variant: 'outline', size: 'sm' }}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex w-full items-center">
            <div className="text-right">
              <div className="text-muted-foreground text-sm">Ставка за урок</div>
              <div className="text-lg font-bold">
                {user.bidForLesson ? user.bidForLesson.toLocaleString() : '—'} ₽
              </div>
            </div>
            <div className="ml-6 text-right">
              <div className="text-muted-foreground text-sm">Ставка за индив.</div>
              <div className="text-lg font-bold">
                {user.bidForIndividual ? user.bidForIndividual.toLocaleString() : '—'} ₽
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <FormDialog
              title="Создать чек"
              FormComponent={PaycheckForm}
              submitButtonProps={{ form: 'paycheck-form' }}
              formComponentProps={{ userId: user.id }}
            />
            {paychecks.map((paycheck) => (
              <Card key={paycheck.id}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4" />
                        {format(paycheck.date, 'dd MMMM yyyy', { locale: ru })}
                      </div>
                      <div className="flex items-center gap-2">
                        <RussianRuble className={`stroke-success h-4 w-4`} />
                        <p className="text-2xl font-bold">{paycheck.amount.toLocaleString()}</p>
                      </div>

                      <div className="text-muted-foreground flex items-start gap-2 text-sm">
                        <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <p className="line-clamp-2">{paycheck.comment}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* <ChangePasswordCard user={user} /> */}
    </>
  )
}
