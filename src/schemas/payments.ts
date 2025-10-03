import { z } from 'zod/v4'

export const PaymentSchema = z.object({
  lessonCount: z.number().int().positive(),
  price: z.number().int().positive(),
  leadName: z.string(),
  productName: z.string(),
})

export type PaymentSchemaType = z.infer<typeof PaymentSchema>
