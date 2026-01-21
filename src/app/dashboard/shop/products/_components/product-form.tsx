'use client'
import { createProduct } from '@/actions/products'
import { ProductSchema, ProductSchemaType } from '@/schemas/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@prisma/client'
import { ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

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
    >
      <div className="grid grid-cols-12 gap-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Название</FieldLabel>
              <Input placeholder="" type="text" className=" " {...field} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Описание</FieldLabel>

              <Textarea {...field} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="price"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Цена</FieldLabel>
              <Input
                placeholder=""
                {...field}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  try {
                    field.onChange(+e.target.value)
                  } catch {
                    field.onChange(0)
                  }
                }}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Количество</FieldLabel>
              <Input
                placeholder=""
                {...field}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  try {
                    field.onChange(+e.target.value)
                  } catch {
                    field.onChange(0)
                  }
                }}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Категория</FieldLabel>
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="image"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Изображение</FieldLabel>

              <Input
                type="file"
                accept="image/*"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  field.onChange(event.target.files![0])
                }}
                ref={field.ref}
                onBlur={field.onBlur}
              />
            </Field>
          )}
        />
      </div>
    </form>
  )
}
