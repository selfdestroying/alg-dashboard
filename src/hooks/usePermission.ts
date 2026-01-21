import { useAuth } from '@/providers/auth-provider'
import { Permission, RoleCodes, rolePermissions } from '@/shared/permissions'

export function usePermission(permission: Permission) {
  const user = useAuth()

  if (!user) return false

  return (
    rolePermissions[user.role.code as (typeof RoleCodes)[keyof typeof RoleCodes]]?.includes(
      permission
    ) ?? false
  )
}
