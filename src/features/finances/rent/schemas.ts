import * as z from 'zod'

export const RentBaseSchema = z.object({
  locationId: z.int().positive('Выберите локацию'),
  startDate: z.string('Укажите дату начала'),
  endDate: z.string('Укажите дату окончания'),
  amount: z.int().positive('Сумма должна быть больше 0'),
  comment: z.string().max(200, 'Комментарий не должен превышать 200 символов').optional(),
})

export const CreateRentSchema = RentBaseSchema

export const UpdateRentSchema = RentBaseSchema.partial().extend({
  id: z.int().positive(),
})

export const DeleteRentSchema = z.object({
  id: z.int().positive(),
})

export type CreateRentSchemaType = z.infer<typeof CreateRentSchema>
export type UpdateRentSchemaType = z.infer<typeof UpdateRentSchema>
export type DeleteRentSchemaType = z.infer<typeof DeleteRentSchema>
