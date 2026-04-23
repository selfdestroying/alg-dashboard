import { useQuery } from '@tanstack/react-query'
import { getMeSalaryPaychecks, getSalaryData } from './actions'
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
      const result = await getSalaryData(filters)
      if (result.serverError) throw new Error(String(result.serverError))
      if (result.validationErrors) throw new Error('Ошибка валидации входных данных')
      if (!result.data) throw new Error('Сервер не вернул данные')
      return result.data
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
      const result = await getMeSalaryPaychecks({ startDate, endDate })
      if (result.serverError) throw new Error(String(result.serverError))
      if (result.validationErrors) throw new Error('Ошибка валидации входных данных')
      if (!result.data) throw new Error('Сервер не вернул данные')
      return result.data
    },
    enabled: !!startDate && !!endDate,
  })
}
