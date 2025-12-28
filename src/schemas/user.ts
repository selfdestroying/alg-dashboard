import { z } from 'zod/v4'
import { RoleEnum } from './enums'

export const UserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().min(2, 'Укажите фамилию').optional(),
  password: z.string().min(4, 'Пароль должен содержать минимум 4 символа'),
  role: RoleEnum,
  passwordRequired: z.boolean(),
  bidForLesson: z.number().positive('Укажите корректную ставку за урок'),
  bidForIndividual: z.number().positive('Укажите корректную ставку за индивидуал'),
})

export type UserSchemaType = z.infer<typeof UserSchema>
