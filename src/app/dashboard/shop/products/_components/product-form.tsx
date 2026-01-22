'use client'
import { createProduct } from '@/actions/products'
import { ProductSchema, ProductSchemaType } from '@/schemas/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function ProductForm({
  categories,
  onSubmit,
}: {
  categories: Category[]
  onSubmit?: () => void
}) {
  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(ProductSchema),
    defaultValues: { name: '', description: '', price: 0, quantity: 1 },
  })

  const handleSubmit = (values: ProductSchemaType) => {
    const ok = createProduct(values)

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Товар успешно создан',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <form
      className="@container space-y-8"
      onSubmit={form.handleSubmit(handleSubmit)}
      id="product-form"
    ></form>
  )
}
