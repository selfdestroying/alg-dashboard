import { apiGet } from '@/actions/api'
import LoginForm from '@/components/forms/login-form'
import { IUser } from '@/types/user'

export default async function Page() {
  const users = await apiGet<IUser[]>('users')
  if (!users.success) {
    return <div>{users.message}</div>
  }
  return <LoginForm users={users.data} />
}
