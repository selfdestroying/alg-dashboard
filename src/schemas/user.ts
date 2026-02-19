import { z } from 'zod/v4'

export const CreateUserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().min(2, 'Укажите фамилию'),
  password: z.string().min(4, 'Пароль должен содержать минимум 4 символа'),
  role: z.enum(['manager', 'teacher'], 'Выберите роль'),
  email: z.email('Введите почту'),
  bidForLesson: z
    .number('Укажите корректную ставку за урок')
    .positive('Ставка должна быть положительной'),
  bidForIndividual: z
    .number('Укажите корректную ставку за индивидуальное занятие')
    .positive('Ставка должна быть положительной'),
  bonusPerStudent: z
    .number('Укажите корректный бонус за ученика')
    .int()
    .gte(0, 'Бонус не может быть отрицательным'),
})

export const EditUserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().optional(),
  roleId: z.number(),
  bidForLesson: z.number().positive('Укажите корректную ставку за урок'),
  bidForIndividual: z.number().positive('Укажите корректную ставку за индивидуал'),
  bonusPerStudent: z.number().int().gte(0, 'Бонус не может быть отрицательным'),
})

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>
export type EditUserSchemaType = z.infer<typeof EditUserSchema>
