import { useQuery } from '@tanstack/react-query'
import { getProfitData } from './actions'
import type { ProfitFilters } from './schemas'

export const profitKeys = {
  all: ['profit'] as const,
  data: (filters: ProfitFilters) => ['profit', 'data', filters] as const,
}

export const useProfitDataQuery = (filters: ProfitFilters | null) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: filters ? profitKeys.data(filters) : profitKeys.all,
    queryFn: async () => {
      if (!filters) return null
      const result = await getProfitData(filters)
      if (result.serverError) throw new Error(String(result.serverError))
      if (result.validationErrors) throw new Error('Ошибка валидации входных данных')
      if (!result.data) throw new Error('Сервер не вернул данные')
      return result.data
    },
    enabled: !!filters,
  })
}
