import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSmartFeed, getSmartFeedPageData, restoreSnoozedAlert, snoozeAlert } from './actions'
import { RestoreSnoozedAlertSchemaType, SnoozeAlertSchemaType } from './schemas'

export const smartFeedKeys = {
  all: ['smart-feed'] as const,
  page: ['smart-feed', 'page'] as const,
}

export const useSmartFeedQuery = () => {
  return useQuery({
    queryKey: smartFeedKeys.all,
    queryFn: async () => {
      const { data, serverError } = await getSmartFeed()
      if (serverError) throw serverError
      return data ?? []
    },
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
  })
}

export const useSmartFeedPageQuery = () => {
  return useQuery({
    queryKey: smartFeedKeys.page,
    queryFn: async () => {
      const { data, serverError } = await getSmartFeedPageData()
      if (serverError) throw serverError
      return data ?? { active: [], snoozed: [] }
    },
    refetchInterval: 5 * 60 * 1000,
  })
}

export const useSnoozeAlertMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SnoozeAlertSchemaType) => {
      const { data, serverError } = await snoozeAlert(input)
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
