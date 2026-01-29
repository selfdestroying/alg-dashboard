export const RoleCodes = {
  admin: 'admin',
  owner: 'owner',
  manager: 'manager',
  teacher: 'teacher',
} as const

export const Permission = {
  EDIT_ATTENDANCE: 'EDIT_ATTENDANCE',
  VIEW_REVENUE: 'VIEW_REVENUE',
  VIEW_PAYMENTS: 'VIEW_PAYMENTS',
  VIEW_OTHER_LESSONS: 'VIEW_OTHER_LESSONS',
  EDIT_GROUP: 'EDIT_GROUP',

  ADD_GROUPTEACHER: 'ADD_GROUPTEACHER',
  ADD_GROUPSTUDENT: 'ADD_GROUPSTUDENT',
  ADD_TEACHERLESSON: 'ADD_TEACHERLESSON',

  EDIT_GROUPTEACHER: 'EDIT_GROUPTEACHER',
  EDIT_GROUPSTUDENT: 'EDIT_GROUPSTUDENT',
  EDIT_TEACHERLESSON: 'EDIT_TEACHERLESSON',

  ADD_PAYCHECK: 'ADD_PAYCHECK',
  EDIT_USER: 'EDIT_USER',

  EDIT_STUDENT: 'EDIT_STUDENT',

  CAN_SELECT_WARNED: 'CAN_SELECT_WARNED',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

export const rolePermissions: Record<(typeof RoleCodes)[keyof typeof RoleCodes], Permission[]> = {
  admin: [
    Permission.EDIT_ATTENDANCE,
    Permission.VIEW_OTHER_LESSONS,
    Permission.EDIT_GROUP,
    Permission.ADD_GROUPTEACHER,
    Permission.ADD_GROUPSTUDENT,
    Permission.EDIT_GROUPTEACHER,
    Permission.EDIT_GROUPSTUDENT,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_REVENUE,
    Permission.EDIT_TEACHERLESSON,
    Permission.ADD_TEACHERLESSON,
    Permission.ADD_PAYCHECK,
    Permission.EDIT_USER,
    Permission.EDIT_STUDENT,
    Permission.CAN_SELECT_WARNED,
  ],
  owner: [
    Permission.EDIT_ATTENDANCE,
    Permission.VIEW_OTHER_LESSONS,
    Permission.EDIT_GROUP,
    Permission.ADD_GROUPTEACHER,
    Permission.ADD_GROUPSTUDENT,
    Permission.EDIT_GROUPTEACHER,
    Permission.EDIT_GROUPSTUDENT,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_REVENUE,
    Permission.EDIT_TEACHERLESSON,
    Permission.ADD_TEACHERLESSON,
    Permission.ADD_PAYCHECK,
    Permission.EDIT_USER,
    Permission.EDIT_STUDENT,
    Permission.CAN_SELECT_WARNED,
  ],
  manager: [
    Permission.EDIT_ATTENDANCE,
    Permission.VIEW_OTHER_LESSONS,
    Permission.EDIT_GROUP,
    Permission.ADD_GROUPTEACHER,
    Permission.ADD_GROUPSTUDENT,
    Permission.EDIT_GROUPTEACHER,
    Permission.EDIT_GROUPSTUDENT,
    Permission.VIEW_PAYMENTS,
    Permission.EDIT_TEACHERLESSON,
    Permission.ADD_TEACHERLESSON,
    Permission.ADD_PAYCHECK,
    Permission.EDIT_USER,
    Permission.EDIT_STUDENT,
    Permission.CAN_SELECT_WARNED,
  ],
  teacher: [],
}
