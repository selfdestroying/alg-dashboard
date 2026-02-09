import { getUsers } from '@/src/actions/users'
import { useQuery } from '@tanstack/react-query'
import { userKeys } from './keys'

export async function getUserList() {
  const data = await getUsers()

  return data
}
export type UserListData = Awaited<ReturnType<typeof getUserList>>

export const useUserListQuery = () => {
  return useQuery({
    queryKey: userKeys.all(),
    queryFn: getUserList,
  })
}

export const useMappedUserListQuery = () => {
  return useQuery({
    queryKey: userKeys.all(),
    queryFn: getUserList,
    select: (users) => users.map((user) => ({ label: user.name, value: user.id.toString() })),
  })
}
