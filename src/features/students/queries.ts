import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createStudent,
  deleteStudent,
  getStudentDetail,
  getStudentGroupHistory,
  getStudentLessonsBalanceHistory,
  getStudents,
  redistributeBalance,
  updateStudent,
  updateStudentBalanceHistory,
  updateStudentCoins,
} from './actions'
import type {
  CreateStudentSchemaType,
  DeleteStudentSchemaType,
  UpdateStudentCoinsSchemaType,
} from './schemas'

export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  detail: (id: number) => ['students', 'detail', id] as const,
  groupHistory: (studentId: number) => ['students', 'groupHistory', studentId] as const,
  balanceHistory: (studentId: number) => ['students', 'balanceHistory', studentId] as const,
}

// ─── Queries ────────────────────────────────────────────────────────

export const useStudentListQuery = () => {
  return useQuery({
    queryKey: studentKeys.all,
    queryFn: async () => {
      const { data, serverError } = await getStudents()
      if (serverError) throw serverError
      return data ?? []
    },
  })
}

export const useStudentDetailQuery = (id: number) => {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: async () => {
      const { data, serverError } = await getStudentDetail({ id })
      if (serverError) throw serverError
      return data ?? null
    },
  })
}

export const useStudentGroupHistoryQuery = (studentId: number) => {
  return useQuery({
    queryKey: studentKeys.groupHistory(studentId),
    queryFn: async () => {
      const { data, serverError } = await getStudentGroupHistory({ studentId })
      if (serverError) throw serverError
      return data ?? []
    },
  })
}

export const useStudentBalanceHistoryQuery = (studentId: number) => {
  return useQuery({
    queryKey: studentKeys.balanceHistory(studentId),
    queryFn: async () => {
      const { data, serverError } = await getStudentLessonsBalanceHistory({ studentId })
      if (serverError) throw serverError
      return data ?? []
    },
  })
}

// ─── Mutations ──────────────────────────────────────────────────────

export const useStudentCreateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CreateStudentSchemaType) => {
      const { data, serverError } = await createStudent(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      toast.success('Ученик успешно создан!')
    },
    onError: (e) => {
      console.error(e)
      toast.error('Ошибка при создании ученика.')
    },
  })
}

export const useStudentDeleteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DeleteStudentSchemaType) => {
      const { data, serverError } = await deleteStudent(input)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      toast.success('Ученик успешно удалён')
    },
    onError: () => {
      toast.error('Ошибка при удалении ученика.')
    },
  })
}

export const useStudentUpdateMutation = (studentId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      payload: Record<string, unknown>
      audit?: Record<string, unknown>
    }) => {
      const { data, serverError } = await updateStudent(input)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(studentId) })
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      toast.success('Ученик успешно обновлён!')
    },
    onError: () => {
      toast.error('Ошибка при обновлении ученика.')
    },
  })
}

export const useStudentCoinsMutation = (studentId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateStudentCoinsSchemaType) => {
      const { data, serverError } = await updateStudentCoins(input)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(studentId) })
      toast.success('Монеты успешно начислены!')
    },
    onError: () => {
      toast.error('Ошибка при начислении монет.')
    },
  })
}

export const useRedistributeBalanceMutation = (studentId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      studentId: number
      allocations: Array<{
        walletId: number
        lessons?: number
        totalLessons?: number
        totalPayments?: number
      }>
    }) => {
      const { data, serverError } = await redistributeBalance(input)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(studentId) })
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      toast.success('Баланс успешно перераспределён!')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Ошибка при перераспределении баланса')
    },
  })
}

export const useStudentBalanceHistoryUpdateMutation = (studentId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: number; data: Record<string, unknown> }) => {
      const { data, serverError } = await updateStudentBalanceHistory(input)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.balanceHistory(studentId) })
      toast.success('Комментарий успешно обновлён')
    },
    onError: () => {
      toast.error('Ошибка при обновлении комментария.')
    },
  })
}
