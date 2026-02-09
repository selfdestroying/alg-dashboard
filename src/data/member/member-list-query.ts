import { getMembers } from '@/src/actions/members'
import { useQuery } from '@tanstack/react-query'
import { memberKeys } from './keys'

export async function getMemberList(organizationId: number) {
  const data = await getMembers({
    where: {
      organizationId,
    },
    include: {
      user: true,
    },
  })

  return data
}
export type MemberListData = Awaited<ReturnType<typeof getMemberList>>

export const useMemberListQuery = (organizationId: number) => {
  return useQuery({
    queryKey: memberKeys.list(organizationId),
    queryFn: () => getMemberList(organizationId),
    enabled: !!organizationId,
  })
}

export const useMappedMemberListQuery = (organizationId: number) => {
  return useQuery({
    queryKey: memberKeys.list(organizationId),
    queryFn: () => getMemberList(organizationId),
    enabled: !!organizationId,
    select: (data) =>
      data.map((member) => ({
        value: member.user.id.toString(),
        label: member.user.name,
      })),
  })
}
