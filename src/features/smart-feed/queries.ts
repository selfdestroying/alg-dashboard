import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSmartFeed, snoozeAlert } from './actions'
import { SnoozeAlertSchemaType } from './schemas'

export const smartFeedKeys = {
  all: ['smart-feed'] as const,
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
