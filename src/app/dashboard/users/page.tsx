import FormDialog from '@/components/button-dialog'
import UserForm from '@/components/forms/user-form'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import prisma from '@/lib/prisma'
import UsersTable from './_components/users-table'

export default async function Page() {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
      passwordRequired: true,
    },
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
          <CardDescription>Список всех пользователей</CardDescription>
          <CardAction>
            <FormDialog
              FormComponent={UserForm}
              title="Добавить пользователя"
              icon="plus"
              submitButtonProps={{
                form: 'user-form',
              }}
              triggerButtonProps={{
                size: 'sm',
              }}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </>
  )
}
