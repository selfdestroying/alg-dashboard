import * as z from 'zod'

export const CreateAttendanceSchema = z.object({
  studentId: z.int('Выберите ученика').positive('Выберите ученика'),
  studentStatus: z.enum(['ACTIVE', 'TRIAL'], 'Выберите статус ученика'),
})

export type CreateAttendanceSchemaType = z.infer<typeof CreateAttendanceSchema>
