import { getUserByAuth, getUsers } from '@/actions/users'
import DashboardPage from './dashboard'

export default async function Page() {
  const user = await getUserByAuth()
  const teachers = await getUsers({})

  return <DashboardPage user={user!} teachers={teachers} />
}
