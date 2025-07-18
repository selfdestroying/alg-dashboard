import { z } from 'zod/v4'
import { GroupTypeEnum } from './enums'

export const GroupSchema = z.object({
  // required
  name: z.string().min(2, 'Укажите название группы'),
  teacherId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  type: GroupTypeEnum,
  startDate: z.date({ error: 'Неверная дата начала' }),
  // optional
  endDate: z.date({ error: 'Неверная дата конца' }).optional(),
  time: z.string().optional(),
  lessonCount: z.number().int().positive().optional(),
  backOfficeUrl: z.string().optional(),
})

export type GroupSchemaType = z.infer<typeof GroupSchema>
