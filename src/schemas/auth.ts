import { UserStatus } from '@prisma/client'
import z from 'zod/v4'

const UserSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  bidForIndividual: z.number(),
  bidForLesson: z.number(),
  createdAt: z.date(),
  roleId: z.number(),
  password: z.string(),
  status: z.enum(UserStatus),
})

export const signInFormSchema = z.object({
  user: z.object({
    label: z.string(),
    value: z.number(),
  }),
  password: z.string(),
})

export const changePasswordSchema = z.object({
  user: z.string().min(1, { message: 'This field is required' }),
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
})

export type SignInFormSchemaType = z.infer<typeof signInFormSchema>
