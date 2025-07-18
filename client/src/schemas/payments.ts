import { z } from 'zod/v4'

export const PaymentSchema = z.object({
  studentId: z.number().int().positive(),
  groupId: z.number().int().positive(),
  lessonsPaid: z.number().int().positive(),
})

export type PaymentSchemaType = z.infer<typeof PaymentSchema>
