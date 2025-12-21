import { z } from 'zod/v4'

export const PaymentProductSchema = z.object({
  productId: z.number().int().positive('ID товара должен быть положительным числом').optional(),
  name: z.string().min(1, 'Название товара обязательно'),
  price: z.number().int().positive('Цена должна быть положительным числом'),
  lessonCount: z.number().int().positive('Кол-во занятий должно быть положительным числом'),
})

export type PaymentProductSchemaType = z.infer<typeof PaymentProductSchema>
