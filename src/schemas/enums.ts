import { AttendanceStatus, GroupType } from '@prisma/client'
import z from 'zod/v4'

export const GroupTypeEnum = z.enum(GroupType)
export const AttendanceStatusEnum = z.enum(AttendanceStatus)
