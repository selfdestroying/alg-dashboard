import { getUser } from '@/actions/users'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChangePasswordCard } from './change-password-card'
import FormDialog from '@/components/button-dialog'
import { getPaychecks } from '@/actions/paycheck'
import PaycheckForm from '@/components/forms/paycheck-form'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, DollarSign, MessageSquare, RussianRuble } from 'lucide-react'

export default async function Page() {


  const user = await getUser()
  const paychecks = await getPaychecks({})

  if (!user) {
    return <div>User not found</div>
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount)
  }

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
                <span className="truncate font-medium">{user.firstName}</span>
                <Badge variant={'outline'}>{user.role}</Badge>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <FormDialog title='Создать чек' FormComponent={PaycheckForm} submitButtonProps={{ form: 'paycheck-form' }} formComponentProps={{ userId: user.id }} />
          {paychecks.map(paycheck =>
            <Card
              key={paycheck.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    {format(paycheck.date, "dd MMMM yyyy", { locale: ru })}
                  </div>

                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <RussianRuble className={`h-5 w-5 stroke-success`} />
                      <p className="text-2xl font-bold">
                        {formatAmount(paycheck.amount)}
                      </p>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">{paycheck.comment}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <ChangePasswordCard user={user} />
    </>
  )
}
