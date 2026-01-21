export const RoleCodes = {
  admin: 'admin',
  owner: 'owner',
  manager: 'manager',
  teacher: 'teacher',
} as const

export const Permission = {
  EDIT_ATTENDANCE: 'EDIT_ATTENDANCE',
  VIEW_OTHER_LESSONS: 'VIEW_OTHER_LESSONS',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

export const rolePermissions: Record<(typeof RoleCodes)[keyof typeof RoleCodes], Permission[]> = {
  admin: [Permission.EDIT_ATTENDANCE, Permission.VIEW_OTHER_LESSONS],
  owner: [Permission.EDIT_ATTENDANCE, Permission.VIEW_OTHER_LESSONS],
  manager: [Permission.EDIT_ATTENDANCE, Permission.VIEW_OTHER_LESSONS],
  teacher: [],
}
