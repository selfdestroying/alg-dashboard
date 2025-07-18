import z from 'zod/v4'

export const signInFormSchema = z.object({
  user: z.string().min(1, { message: 'This field is required' }),
  password: z.string(),
})
