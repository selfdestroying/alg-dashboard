import { z } from 'zod/v4'
import { GroupTypeEnum } from './enums'

export const GroupSchema = z.object({
  // required
  teacherId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  startDate: z.date({ error: 'Неверная дата начала' }),
  // optional
  type: GroupTypeEnum.optional(),
  endDate: z.date({ error: 'Неверная дата конца' }).optional(),
  time: z.string().optional(),
  lessonCount: z.number().int().positive().optional(),
  lessonsPerWeek: z.number().int().positive().optional(),
  backOfficeUrl: z.string().optional(),
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

export type GroupSchemaType = z.infer<typeof GroupSchema>
export type StudentGroupSchemaType = z.infer<typeof StudentGroupSchema>
export type GroupStudentSchemaType = z.infer<typeof GroupsStudentSchema>
export type DismissSchemaType = z.infer<typeof DismissSchema>
