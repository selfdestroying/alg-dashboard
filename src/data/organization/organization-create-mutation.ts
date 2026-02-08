import { createOrganization, OrganizationCreateParams } from '@/src/actions/organizations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { organizationKeys } from './keys'

export const useOrganizationCreateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: OrganizationCreateParams) => createOrganization(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.all(),
      })
      toast.success('Organization created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create organization')
    },
  })
}
