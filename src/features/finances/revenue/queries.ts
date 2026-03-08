import { useQuery } from '@tanstack/react-query'
import { getRevenueLessons } from './actions'
import type { RevenueFilters } from './types'

export const revenueKeys = {
  all: ['revenue'] as const,
  lessons: (filters: RevenueFilters) => ['revenue', 'lessons', filters] as const,
}

export const useRevenueLessonsQuery = (filters: RevenueFilters | null) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: filters ? revenueKeys.lessons(filters) : revenueKeys.all,
    queryFn: async () => {
      if (!filters) return []
      const { data, serverError } = await getRevenueLessons(filters)
      if (serverError) throw serverError
      return data ?? []
    },
    enabled: !!filters,
  })
}
