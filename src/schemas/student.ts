import * as z from 'zod'
import { normalizeDateOnly } from '../lib/timezone'

const StudentBaseFields = {
  firstName: z.string({ error: 'Укажите имя' }).min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z
    .string({ error: 'Укажите фамилию' })
    .min(2, 'Фамилия должна содержать минимум 2 символа'),
  birthDate: z.date().transform(normalizeDateOnly).nullish(),
  url: z
    .string()
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v))
    .pipe(z.url('Укажите корректный URL').optional()),
}

export const CreateStudentSchema = z.object({
  ...StudentBaseFields,
})

export const EditStudentSchema = z.object({
  ...StudentBaseFields,
})

export type CreateStudentSchemaType = z.infer<typeof CreateStudentSchema>
export type EditStudentSchemaType = z.infer<typeof EditStudentSchema>
