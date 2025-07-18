import { AttendanceStatus, GroupType, Role } from '@prisma/client'
import z from 'zod/v4'

export const RoleEnum = z.enum(Role)
export const GroupTypeEnum = z.enum(GroupType)
export const AttendanceStatusEnum = z.enum(AttendanceStatus)
