import { UserStatus } from '@prisma/client'
import { z } from 'zod/v4'

export const CreateUserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().min(2, 'Укажите фамилию'),
  password: z.string().min(4, 'Пароль должен содержать минимум 4 символа'),
  role: z.object(
    {
      label: z.string(),
      value: z.number(),
    },
    'Выберите роль'
  ),
  bidForLesson: z
    .number('Укажите корректную ставку за урок')
    .positive('Ставка должна быть положительной'),
  bidForIndividual: z
    .number('Укажите корректную ставку за индивидуальное занятие')
    .positive('Ставка должна быть положительной'),
})

export const EditUserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().optional(),
  roleId: z.number(),
  status: z.enum(UserStatus),
  bidForLesson: z.number().positive('Укажите корректную ставку за урок'),
  bidForIndividual: z.number().positive('Укажите корректную ставку за индивидуал'),
})

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>
export type EditUserSchemaType = z.infer<typeof EditUserSchema>
