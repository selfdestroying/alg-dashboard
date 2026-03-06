import { comboboxNumber } from '@/src/schemas/_primitives'
import * as z from 'zod'

export const CreatePaymentSchema = z.object({
  student: comboboxNumber('Выберите студента'),
  group: comboboxNumber('Выберите группу'),
  lessonCount: z.number('Укажите количество занятий').int().positive(),
  price: z.number('Укажите сумму').int().positive(),
  leadName: z.string('Укажите имя лида'),
  productName: z.string('Укажите название товара'),
})

export const CancelPaymentSchema = z.object({
  id: z.number().int().positive(),
})

export const ResolveUnprocessedPaymentSchema = z.object({
  unprocessedPaymentId: z.number().int().positive(),
  student: comboboxNumber('Выберите студента'),
  group: comboboxNumber('Выберите группу'),
  lessonCount: z.number('Укажите количество занятий').int().positive(),
  price: z.number('Укажите сумму').int().positive(),
  leadName: z.string('Укажите имя лида'),
  productName: z.string('Укажите название товара'),
})

export const DeleteUnprocessedPaymentSchema = z.object({
  id: z.number().int().positive(),
})

export type CreatePaymentSchemaType = z.infer<typeof CreatePaymentSchema>
export type CancelPaymentSchemaType = z.infer<typeof CancelPaymentSchema>
export type ResolveUnprocessedPaymentSchemaType = z.infer<typeof ResolveUnprocessedPaymentSchema>
export type DeleteUnprocessedPaymentSchemaType = z.infer<typeof DeleteUnprocessedPaymentSchema>
