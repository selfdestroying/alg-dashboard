import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createSnoozedAlert,
  getAbsentStreak as getAbsentStreaks,
  getLowBalance,
  getUnmarkedAttendance,
  restoreSnoozedAlert,
} from './actions'
import { RestoreSnoozedAlertSchemaType, SnoozeAlertSchemaType } from './schemas'

export const smartFeedKeys = {
  all: ['smart-feed'] as const,
  page: ['smart-feed', 'page'] as const,
  absentStreak: ['smart-feed', 'absent-streak'] as const,
  unmarkedAttendance: ['smart-feed', 'unmarked-attendance'] as const,
  lowBalance: ['smart-feed', 'low-balance'] as const,
}

export const useAbsentStreaksQuery = () => {
  return useQuery({
    queryKey: smartFeedKeys.absentStreak,
    queryFn: async () => {
      const { data, serverError } = await getAbsentStreaks({ withSnoozed: false })
      if (serverError) throw serverError
      return data
    },
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
  })
}

export const useUnmarkedAttendnace = () => {
  return useQuery({
    queryKey: smartFeedKeys.unmarkedAttendance,
    queryFn: async () => {
      const { data, serverError } = await getUnmarkedAttendance()
      if (serverError) throw serverError
      return data
    },
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
  })
}

export const useLowBalanceQuery = () => {
  return useQuery({
    queryKey: smartFeedKeys.lowBalance,
    queryFn: async () => {
      const { data, serverError } = await getLowBalance({ withSnoozed: false })
      if (serverError) throw serverError
      return data
    },
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
  })
}

export const useCreateSnoozedAlertMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SnoozeAlertSchemaType) => {
      const { data, serverError } = await createSnoozedAlert(input)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartFeedKeys.all })
      toast.success('Уведомление отложено')
    },
    onError: () => {
      toast.error('Не удалось отложить уведомление')
    },
  })
}

export const useRestoreSnoozedAlertMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RestoreSnoozedAlertSchemaType) => {
      const { data, serverError } = await restoreSnoozedAlert(input)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartFeedKeys.all })
      queryClient.invalidateQueries({ queryKey: smartFeedKeys.page })
      toast.success('Уведомление возвращено в активные')
    },
    onError: () => {
      toast.error('Не удалось вернуть уведомление')
    },
  })
}
