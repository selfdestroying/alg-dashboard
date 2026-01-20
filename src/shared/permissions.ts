export const RoleCodes = {
  admin: 'admin',
  owner: 'owner',
  manager: 'manager',
  teacher: 'teacher',
} as const

export const Permission = {
  EDIT_ATTENDANCE: 'EDIT_ATTENDANCE',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

export const rolePermissions: Record<(typeof RoleCodes)[keyof typeof RoleCodes], Permission[]> = {
  admin: [Permission.EDIT_ATTENDANCE],
  owner: [Permission.EDIT_ATTENDANCE],
  manager: [Permission.EDIT_ATTENDANCE],
  teacher: [],
}
