import { useQuery } from '@tanstack/react-query'
import { getGroups } from './actions'

export const groupKeys = {
  all: ['groups'] as const,
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
