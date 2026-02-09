import z from 'zod/v4'

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
