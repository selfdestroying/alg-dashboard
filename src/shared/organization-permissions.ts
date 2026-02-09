import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, ownerAc } from 'better-auth/plugins/organization/access'

export const statement = {
  ...defaultStatements,
  group: ['create', 'read', 'update', 'delete'],
  lesson: ['create', 'readSelf', 'readAll', 'update', 'delete'],
  student: ['create', 'read', 'update', 'delete'],
  payment: ['create', 'read', 'update', 'delete'],
  paycheck: ['create', 'read', 'update', 'delete'],
  salary: ['readSelf', 'readAll'],

  teacherGroup: ['create', 'read', 'update', 'delete'],
  teacherLesson: ['create', 'read', 'update', 'delete'],
  studentGroup: ['create', 'read', 'update', 'delete'],
  studentLesson: ['create', 'read', 'update', 'delete', 'selectWarned'],
} as const

export const ac = createAccessControl(statement)

export const teacher = ac.newRole({
  group: ['read'],
  lesson: ['readSelf'],
  student: ['read'],
  payment: ['read'],
  paycheck: ['read'],
  salary: ['readSelf'],

  teacherGroup: ['read'],
  studentGroup: ['read'],
  teacherLesson: ['read'],
  studentLesson: ['read', 'update'],
})

export const manager = ac.newRole({
  group: ['create', 'read', 'update', 'delete'],
  lesson: ['create', 'readSelf', 'readAll', 'update', 'delete'],
  student: ['create', 'read', 'update', 'delete'],
  payment: ['create', 'read', 'update', 'delete'],
  paycheck: ['create', 'read', 'update', 'delete'],
  salary: ['readSelf', 'readAll'],

  teacherGroup: ['create', 'read', 'update', 'delete'],
  studentGroup: ['create', 'read', 'update', 'delete'],
  teacherLesson: ['create', 'read', 'update', 'delete'],
  studentLesson: ['create', 'read', 'update', 'delete', 'selectWarned'],
})

export const owner = ac.newRole({
  ...ownerAc.statements,
  ...manager.statements,
  organization: ['update'],
})

export type OrganizationStatementKeys = keyof typeof statement
export type OrganizationAction<T extends OrganizationStatementKeys> = (typeof statement)[T][number]
export type OrganizationPermissionCheck = {
  [R in OrganizationStatementKeys]?: Array<OrganizationAction<R>>
}
