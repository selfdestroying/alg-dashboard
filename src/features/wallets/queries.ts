import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createWallet,
  deleteWallet,
  getStudentWallets,
  linkGroupToWallet,
  mergeWallets,
  transferWalletBalance,
  updateWalletBalance,
} from './actions'
import type {
  CreateWalletSchemaType,
  DeleteWalletSchemaType,
  LinkGroupToWalletSchemaType,
  MergeWalletsSchemaType,
  TransferWalletBalanceSchemaType,
  UpdateWalletBalanceSchemaType,
} from './schemas'

export const walletKeys = {
  all: ['wallets'] as const,
  byStudent: (studentId: number) => ['wallets', 'student', studentId] as const,
}

export const useStudentWalletsQuery = (studentId: number) => {
  return useQuery({
    queryKey: walletKeys.byStudent(studentId),
    queryFn: async () => {
      const { data, serverError } = await getStudentWallets({ studentId })
      if (serverError) throw serverError
      return data ?? []
    },
  })
}

export const useCreateWalletMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreateWalletSchemaType) => {
      const { data, serverError } = await createWallet(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.byStudent(variables.studentId) })
      toast.success('Кошелёк создан')
    },
    onError: () => toast.error('Не удалось создать кошелёк'),
  })
}

export const useUpdateWalletBalanceMutation = (studentId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: UpdateWalletBalanceSchemaType) => {
      const { data, serverError } = await updateWalletBalance(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.byStudent(studentId) })
      toast.success('Баланс обновлён')
    },
    onError: () => toast.error('Не удалось обновить баланс'),
  })
}

export const useMergeWalletsMutation = (studentId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: MergeWalletsSchemaType) => {
      const { data, serverError } = await mergeWallets(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.byStudent(studentId) })
      toast.success('Кошельки объединены')
    },
    onError: () => toast.error('Не удалось объединить кошельки'),
  })
}

export const useTransferWalletBalanceMutation = (studentId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: TransferWalletBalanceSchemaType) => {
      const { data, serverError } = await transferWalletBalance(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.byStudent(studentId) })
      toast.success('Баланс переведён')
    },
    onError: () => toast.error('Не удалось перевести баланс'),
  })
}

export const useLinkGroupToWalletMutation = (studentId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: LinkGroupToWalletSchemaType) => {
      const { data, serverError } = await linkGroupToWallet(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.byStudent(studentId) })
      toast.success('Группа привязана к кошельку')
    },
    onError: () => toast.error('Не удалось привязать группу'),
  })
}

export const useDeleteWalletMutation = (studentId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: DeleteWalletSchemaType) => {
      const { data, serverError } = await deleteWallet(values)
      if (serverError) throw serverError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.byStudent(studentId) })
      toast.success('Кошелёк удалён')
    },
    onError: () => toast.error('Не удалось удалить кошелёк'),
  })
}
