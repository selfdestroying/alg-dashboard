import * as z from 'zod'

export const AddTeacherToGroupSchema = z.object({
  teacherId: z.int('Выберите преподавателя').positive('Выберите преподавателя'),
  rateId: z.int('Выберите ставку').positive('Выберите ставку'),
  isApplyToLesson: z.boolean(),
})

export const EditTeacherGroupSchema = z.object({
  rateId: z.number('Выберите ставку').int().positive('Выберите ставку'),
  isApplyToLessons: z.boolean(),
})

export type AddTeacherToGroupSchemaType = z.infer<typeof AddTeacherToGroupSchema>
export type EditTeacherGroupSchemaType = z.infer<typeof EditTeacherGroupSchema>
