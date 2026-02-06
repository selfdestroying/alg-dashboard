import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import prisma from '@/src/lib/prisma'
import CreateUserDialog from './_components/create-user-dialog'
import UsersTable from './_components/users-table'

export default async function Page() {
  const users = await prisma.user.findMany({
    include: {
      role: true,
    },
  })

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
          <UsersTable data={users} />
        </CardContent>
      </Card>
    </div>
  )
}
