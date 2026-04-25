import { useQuery } from '@tanstack/react-query'
import { getActiveSessions, getMyIncomeHistory, getMyPaychecks } from './actions'

export const meKeys = {
  all: ['me'] as const,
  sessions: () => [...meKeys.all, 'sessions'] as const,
  paychecks: () => [...meKeys.all, 'paychecks'] as const,
  incomeHistory: () => [...meKeys.all, 'income-history'] as const,
}

export const useActiveSessionsQuery = () => {
  return useQuery({
    queryKey: meKeys.sessions(),
    queryFn: async () => {
      const { data, serverError } = await getActiveSessions()
      if (serverError) throw serverError
      return data ?? []
    },
  })
}

export const useMyPaychecksQuery = () => {
  return useQuery({
    queryKey: meKeys.paychecks(),
    queryFn: async () => {
      const { data, serverError } = await getMyPaychecks()
      if (serverError) throw serverError
      return data ?? []
    },
  })
}

export const useMyIncomeHistoryQuery = () => {
  return useQuery({
    queryKey: meKeys.incomeHistory(),
    queryFn: async () => {
      const { data, serverError } = await getMyIncomeHistory()
      if (serverError) throw serverError
      return data ?? []
    },
  })
}
