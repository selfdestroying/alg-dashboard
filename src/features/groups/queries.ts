import type { ArchiveGroupSchemaType } from '@/src/schemas/group'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { archiveGroup, countFutureLessons, getGroups } from './actions'

export const groupKeys = {
  all: ['groups'] as const,
  futureLessonsCount: (groupId: number) => ['groups', 'futureLessonsCount', groupId] as const,
}

export const useGroupListQuery = () => {
  return useQuery({
    queryKey: groupKeys.all,
    queryFn: async () => {
      const { data, serverError } = await getGroups()
      if (serverError) throw serverError
      return data ?? []
    },
  })
}

export const useFutureLessonsCountQuery = (
  groupId: number,
  afterDate?: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [...groupKeys.futureLessonsCount(groupId), afterDate],
    queryFn: async () => {
      const { data, serverError } = await countFutureLessons({ groupId, afterDate })
      if (serverError) throw serverError
      return data ?? 0
    },
    enabled: options?.enabled,
  })
}

export const useArchiveGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ArchiveGroupSchemaType) => {
      const { data, serverError } = await archiveGroup(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
      toast.success('Группа успешно архивирована!')
    },
    onError: () => {
      toast.error('Ошибка при архивации группы.')
    },
  })
}
