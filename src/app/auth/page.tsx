import { getUsers } from '@/actions/users'
import LoginForm from '@/components/forms/login-form'

export default async function Page() {
  const users = await getUsers()
  return <LoginForm users={users} />
}
