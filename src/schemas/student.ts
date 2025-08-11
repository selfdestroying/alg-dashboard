import { z } from 'zod/v4'

export const StudentSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().min(2, 'Укажите фамилию'),
  age: z
    .number({ error: 'This field must be a number' })
    .gte(6, { message: 'Must be greater than or equal to  6' })
    .lte(17, { message: 'Must be less than or equal to 17' }),
  parentsName: z.string().min(2, 'Укажите имя родителя'),
  crmUrl: z.url('Укажите корректный URL'),
})

export type StudentSchemaType = z.infer<typeof StudentSchema>
