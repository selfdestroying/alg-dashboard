import { useQuery } from '@tanstack/react-query'
import { getRevenueData } from './actions'
import type { RevenueFilters } from './schemas'

export const revenueKeys = {
  all: ['revenue'] as const,
  data: (filters: RevenueFilters) => ['revenue', 'data', filters] as const,
}

export const useRevenueDataQuery = (filters: RevenueFilters | null) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: filters ? revenueKeys.data(filters) : revenueKeys.all,
    queryFn: async () => {
      if (!filters) return null
      const { data, serverError } = await getRevenueData(filters)
      if (serverError) throw serverError
      return data ?? null
    },
    enabled: !!filters,
  })
}
