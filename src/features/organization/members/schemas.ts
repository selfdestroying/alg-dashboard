import { combobox, DateOnlySchema } from '@/src/schemas/_primitives'
import * as z from 'zod'

// ─── Member (User) schemas ──────────────────────────────────────────

const MemberBaseSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().min(2, 'Укажите фамилию'),
})

export const CreateMemberSchema = MemberBaseSchema.extend({
  password: z.string().min(4, 'Пароль должен содержать минимум 4 символа'),
  role: z.enum(['manager', 'teacher'], 'Выберите роль'),
  email: z.email('Введите почту'),
})

export const UpdateMemberSchema = z.object({
  memberId: z.string(),
  userId: z.number().int().positive(),
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().optional(),
  role: combobox('Выберите роль'),
  banned: z.boolean(),
})

export type CreateMemberSchemaType = z.infer<typeof CreateMemberSchema>
export type UpdateMemberSchemaType = z.infer<typeof UpdateMemberSchema>

// ─── Paycheck schemas ───────────────────────────────────────────────

export const PayCheckTypeSchema = z.enum(['SALARY', 'BONUS', 'ADVANCE'])

export const CreatePaycheckSchema = z.object({
  amount: z.number('Укажите корректную сумму'),
  date: DateOnlySchema,
  comment: z.string('Укажите комментарий').max(255),
  type: PayCheckTypeSchema,
})

export const UpdatePaycheckSchema = CreatePaycheckSchema.extend({
  id: z.number().int().positive(),
})

export const DeletePaycheckSchema = z.object({
  id: z.number().int().positive(),
})

export type CreatePaycheckSchemaType = z.infer<typeof CreatePaycheckSchema>
export type UpdatePaycheckSchemaType = z.infer<typeof UpdatePaycheckSchema>
export type DeletePaycheckSchemaType = z.infer<typeof DeletePaycheckSchema>
