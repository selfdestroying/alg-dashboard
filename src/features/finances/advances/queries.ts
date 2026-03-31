import { useQuery } from '@tanstack/react-query'
import { getAdvancesData } from './actions'
import type { AdvancesFilters } from './schemas'

export const advancesKeys = {
  all: ['advances'] as const,
  data: (filters: AdvancesFilters) => ['advances', 'data', filters] as const,
}

export const useAdvancesDataQuery = (filters: AdvancesFilters | null) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: filters ? advancesKeys.data(filters) : advancesKeys.all,
    queryFn: async () => {
      if (!filters) return null
      const { data, serverError } = await getAdvancesData(filters)
      if (serverError) throw serverError
      return data ?? null
    },
    enabled: !!filters,
  })
}
