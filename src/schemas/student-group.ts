import * as z from 'zod'
import { comboboxNumber } from './_primitives'

export const AddStudentToGroupSchema = z.object({
  target: comboboxNumber('Выберите значение'),
  isApplyToLesson: z.boolean(),
  walletId: z.number().int().positive().optional(),
})

export type AddStudentToGroupSchemaType = z.infer<typeof AddStudentToGroupSchema>
