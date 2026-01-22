import { AttendanceStatus } from '@prisma/client'
import z from 'zod/v4'

export const AttendanceStatusEnum = z.enum(AttendanceStatus)
