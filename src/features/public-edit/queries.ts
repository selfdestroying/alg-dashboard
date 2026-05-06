import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  confirmPublicDataActuality,
  createPublicParent,
  updatePublicParent,
  updatePublicStudent,
} from './actions'
import type {
  ConfirmPublicActualitySchemaType,
  CreatePublicParentSchemaType,
  UpdatePublicParentSchemaType,
  UpdatePublicStudentSchemaType,
} from './schemas'

export const publicEditKeys = {
  all: ['public-edit'] as const,
  byToken: (token: string) => ['public-edit', token] as const,
}

// ─── Mutations ──────────────────────────────────────────────────────

export const useUpdatePublicStudentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdatePublicStudentSchemaType) => {
      const { data, serverError } = await updatePublicStudent(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: publicEditKeys.byToken(variables.token) })
      toast.success('Данные ребёнка сохранены.')
    },
    onError: () => toast.error('Не удалось сохранить данные ребёнка. Попробуйте ещё раз.'),
  })
}

export const useUpdatePublicParentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdatePublicParentSchemaType) => {
      const { data, serverError } = await updatePublicParent(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: publicEditKeys.byToken(variables.token) })
      toast.success('Данные родителя сохранены.')
    },
    onError: () => toast.error('Не удалось сохранить данные родителя. Попробуйте ещё раз.'),
  })
}

export const useCreatePublicParentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreatePublicParentSchemaType) => {
      const { data, serverError } = await createPublicParent(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: publicEditKeys.byToken(variables.token) })
      toast.success('Родитель добавлен.')
    },
    onError: () => toast.error('Не удалось добавить родителя. Попробуйте ещё раз.'),
  })
}

export const useConfirmPublicActualityMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: ConfirmPublicActualitySchemaType) => {
      const { data, serverError } = await confirmPublicDataActuality(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: publicEditKeys.byToken(variables.token) })
      toast.success('Актуальность данных подтверждена.')
    },
    onError: () => toast.error('Не удалось подтвердить актуальность данных.'),
  })
}
