import * as z from 'zod'

export const AddTeacherToLessonSchema = z.object({
  teacherId: z.int('Выберите преподавателя').positive('Выберите преподавателя'),
  bid: z.number('Не указана ставка').int('Ставка должна быть числом'),
  bonusPerStudent: z
    .number('Не указан бонус за ученика')
    .int('Бонус за ученика должен быть числом'),
})

export const EditTeacherLessonSchema = z.object({
  bid: z
    .number('Не указана ставка')
    .int('Ставка должна быть числом')
    .gte(0, 'Ставка должна быть >= 0'),
  bonusPerStudent: z
    .number('Не указан бонус')
    .int('Бонус должен быть целым числом')
    .gte(0, 'Бонус должен быть >= 0'),
})

export type AddTeacherToLessonSchemaType = z.infer<typeof AddTeacherToLessonSchema>
export type EditTeacherLessonSchemaType = z.infer<typeof EditTeacherLessonSchema>
