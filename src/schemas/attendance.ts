import * as z from 'zod'

export const CreateAttendanceSchema = z.object({
  studentId: z.int('Выберите ученика').positive('Выберите ученика'),
  isTrial: z.boolean(),
})

export type CreateAttendanceSchemaType = z.infer<typeof CreateAttendanceSchema>
