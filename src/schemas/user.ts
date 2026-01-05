import { UserStatus } from '@prisma/client'
import { z } from 'zod/v4'
import { RoleEnum } from './enums'

export const CreateUserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().optional(),
  password: z.string().min(4, 'Пароль должен содержать минимум 4 символа'),
  role: RoleEnum,
  passwordRequired: z.boolean(),
  bidForLesson: z.number().positive('Укажите корректную ставку за урок'),
  bidForIndividual: z.number().positive('Укажите корректную ставку за индивидуал'),
})

export const EditUserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().optional(),
  role: RoleEnum,
  status: z.enum(UserStatus),
  passwordRequired: z.boolean(),
  bidForLesson: z.number().positive('Укажите корректную ставку за урок'),
  bidForIndividual: z.number().positive('Укажите корректную ставку за индивидуал'),
})

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>
export type EditUserSchemaType = z.infer<typeof EditUserSchema>
