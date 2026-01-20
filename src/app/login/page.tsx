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
    orderBy: { role: { id: 'asc' } },
  })

  const groupedUsers = [
    ...Object.values(
      users.reduce<Record<string, GroupedUser>>((acc, user) => {
        const roleName = user.role.name
        if (!acc[roleName]) {
          acc[roleName] = { value: roleName, items: [] }
        }
        acc[roleName].items.push({
          label: getFullName(user.firstName, user.lastName),
          value: user.id,
        })
        return acc
      }, {})
    ),
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
