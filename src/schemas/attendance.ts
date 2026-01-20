import { AttendanceStatus, StudentStatus } from '@prisma/client'
import { z } from 'zod/v4'

export const AttendanceSchema = z.object({
  studentId: z.number().positive(),
  lessonId: z.number().positive(),
  studentStatus: z.enum(StudentStatus),
  status: z.enum(AttendanceStatus),
  comment: z.string(),
})

export type AttendanceSchemaType = z.infer<typeof AttendanceSchema>
