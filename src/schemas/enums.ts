import { AttendanceStatus } from '@/prisma/generated/enums'
import z from 'zod/v4'

export const AttendanceStatusEnum = z.enum(AttendanceStatus)
