import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createStudent, deleteStudent, getStudents } from './actions'
import { CreateStudentSchemaType, DeleteStudentSchemaType } from './schemas'

export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
}

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
