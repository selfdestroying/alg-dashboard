import { getUser, getUsers } from '@/actions/users'
import DashboardPage from './dashboard'

export default async function Page() {
  const user = await getUser()
  const teachers = await getUsers()

  return <DashboardPage user={user!} teachers={teachers} />
}
