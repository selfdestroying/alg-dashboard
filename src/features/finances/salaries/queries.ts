import { useQuery } from '@tanstack/react-query'
import { getSalaryData, getSalaryPaychecks } from './actions'
import type { SalaryFilters } from './types'

export const salaryKeys = {
  all: ['salary'] as const,
  data: (filters: SalaryFilters) => ['salary', 'data', filters] as const,
  paychecks: (startDate: string, endDate: string) =>
    ['salary', 'paychecks', startDate, endDate] as const,
}

export const useSalaryDataQuery = (filters: SalaryFilters | null) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: filters ? salaryKeys.data(filters) : salaryKeys.all,
    queryFn: async () => {
      if (!filters) return null
      const { data, serverError } = await getSalaryData(filters)
      if (serverError) throw serverError
      return data ?? null
    },
    enabled: !!filters,
  })
}

export const useSalaryPaychecksQuery = (startDate: string | null, endDate: string | null) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: startDate && endDate ? salaryKeys.paychecks(startDate, endDate) : salaryKeys.all,
    queryFn: async () => {
      if (!startDate || !endDate) return []
      const { data, serverError } = await getSalaryPaychecks({ startDate, endDate })
      if (serverError) throw serverError
      return data ?? []
    },
    enabled: !!startDate && !!endDate,
  })
}
