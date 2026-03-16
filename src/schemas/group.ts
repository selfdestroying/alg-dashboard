import * as z from 'zod'
import { DateOnlySchema } from './_primitives'

export const CreateGroupSchema = z.object({
  name: z.string(),
  teacherId: z.int('Выберите учителя').positive('Выберите учителя'),
  rateId: z.int('Выберите ставку').positive('Выберите ставку'),
  courseId: z.int('Выберите курс').positive('Выберите курс'),
  locationId: z.int('Выберите локацию').positive('Выберите локацию'),
  startDate: DateOnlySchema,
  groupTypeId: z.number({ error: 'Выберите тип группы' }).int().positive(),
  schedule: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        time: z.string().min(1, 'Выберите время'),
      }),
    )
    .min(1, 'Выберите хотя бы один день занятий'),
  lessonCount: z
    .number('Введите количество занятий')
    .positive('Количество занятий должно быть положительным'),
  maxStudents: z
    .number('Введите максимальное количество учеников')
    .int()
    .positive('Количество должно быть положительным'),
  url: z.url('Неверный URL').optional(),
})

export const EditGroupSchema = z.object({
  courseId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional(),
  groupTypeId: z.number().int().positive().optional(),
  maxStudents: z
    .number('Введите максимальное количество учеников')
    .int()
    .positive('Количество должно быть положительным')
    .optional(),
  url: z.string().optional(),
})

export const UpdateScheduleAndLessonsSchema = z.object({
  schedule: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        time: z.string().min(1, 'Выберите время'),
      }),
    )
    .min(1, 'Выберите хотя бы один день занятий'),
  startDate: DateOnlySchema.optional(),
  lessonCount: z.number().int().positive('Количество занятий должно быть положительным').optional(),
})

export const ArchiveGroupSchema = z.object({
  groupId: z.number().int().positive(),
  archivedAt: z.string().optional(),
  comment: z.string().optional(),
  deleteFutureLessons: z.boolean(),
})

export type CreateGroupSchemaType = z.infer<typeof CreateGroupSchema>
export type EditGroupSchemaType = z.infer<typeof EditGroupSchema>
export type UpdateScheduleAndLessonsSchemaType = z.infer<typeof UpdateScheduleAndLessonsSchema>
export type ArchiveGroupSchemaType = z.infer<typeof ArchiveGroupSchema>
