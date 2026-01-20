import { getUsers } from '@/actions/users'
import { SwitchThemeButton } from '@/components/switch-theme-button'
import { getFullName } from '@/lib/utils'
import LoginForm from './_components/login-form'

interface GroupedUser {
  value: string
  items: {
    label: string
    value: number
  }[]
}

export default async function Page() {
  const users = await getUsers({
    include: { role: true },
  })

  const admins = users.filter((user) => user.roleId === 1)
  const managers = users.filter((user) => user.roleId === 2)
  const owners = users.filter((user) => user.roleId === 3)
  const teachers = users.filter((user) => user.roleId === 4)

  const groupedUsers = [
    {
      value: 'Администраторы',
      items: admins.map((user) => ({
        label: getFullName(user.firstName, user.lastName),
        value: user.id,
      })),
    },
    {
      value: 'Владельцы',
      items: owners.map((user) => ({
        label: getFullName(user.firstName, user.lastName),
        value: user.id,
      })),
    },
    {
      value: 'Менеджеры',
      items: managers.map((user) => ({
        label: getFullName(user.firstName, user.lastName),
        value: user.id,
      })),
    },
    {
      value: 'Преподаватели',
      items: teachers.map((user) => ({
        label: getFullName(user.firstName, user.lastName),
        value: user.id,
      })),
    },
  ]

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="self-end">
          <SwitchThemeButton />
        </div>
        <LoginForm groupedUsers={groupedUsers} />
      </div>
    </div>
  )
}
