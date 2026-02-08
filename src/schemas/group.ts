import { GroupType } from '@/prisma/generated/enums'
import { z } from 'zod/v4'

export const CreateGroupSchema = z.object({
  // required
  name: z.string(),
  teacher: z.object(
    {
      label: z.string(),
      value: z.string(),
    },
    'Выберите преподавателя'
  ),
  course: z.object(
    {
      label: z.string(),
      value: z.string(),
    },
    'Выберите курс'
  ),
  location: z.object(
    {
      label: z.string(),
      value: z.string(),
    },
    'Выберите локацию'
  ),
  dateRange: z.object(
    {
      from: z.date('Выберите дату начала'),
      to: z.date('Выберите дату окончания'),
    },
    'Выберите период'
  ),
  type: z.enum(GroupType, 'Выберите тип группы'),
  time: z.string('Выберите время'),
  lessonCount: z
    .number('Введите количество занятий')
    .positive('Количество занятий должно быть положительным'),
  // optional
  lessonsPerWeek: z.number().int().positive().optional(),
  backOfficeUrl: z.url('Неверный URL').optional(),
})

export const editGroupSchema = z.object({
  courseId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional(),
  type: z.enum(GroupType).optional(),
  time: z.string().optional(),
  backOfficeUrl: z.string().optional(),
  dayOfWeek: z.number().int().optional(),
})

export const StudentGroupSchema = z.object({
  studentId: z.number({
    error: 'Please select a student.',
  }),
})

export const GroupsStudentSchema = z.object({
  groupId: z.number({
    error: 'Please select a student.',
  }),
})

export const DismissSchema = z.object({
  groupId: z.number(),
  studentId: z.number(),
  comment: z.string(),
  date: z.date(),
})

export type CreateGroupSchemaType = z.infer<typeof CreateGroupSchema>
export type EditGroupSchemaType = z.infer<typeof editGroupSchema>
export type StudentGroupSchemaType = z.infer<typeof StudentGroupSchema>
export type GroupStudentSchemaType = z.infer<typeof GroupsStudentSchema>
export type DismissSchemaType = z.infer<typeof DismissSchema>
