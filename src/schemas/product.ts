import { z } from 'zod/v4'

export const ProductSchema = z.object({
  name: z.string().min(1, 'Название обязательно к заполнению.'),
  description: z.string().optional(),
  price: z.number().min(0, 'Цена не может быть отрицательной.'),
  originalPrice: z.number().optional(),
  quantity: z.number().min(1),
  image: z.file().mime(['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']).optional(),
  categoryId: z.number().int('ID категории должен быть целым числом.'),
})

export type ProductSchemaType = z.infer<typeof ProductSchema>
