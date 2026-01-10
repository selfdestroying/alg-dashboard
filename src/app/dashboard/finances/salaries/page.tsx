import { getMe } from '@/actions/users'
import Salaries from './salaries'

export default async function Page() {
  const user = await getMe()

  return user?.role == 'TEACHER' || user?.role == 'MANAGER' ? (
    <Salaries userId={user.id} />
  ) : (
    <Salaries />
  )
}
