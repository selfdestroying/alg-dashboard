'use client'
import { createPaymentProduct } from '@/actions/payments'

import { Input } from '@/components/ui/input'
import { PaymentProductSchema, PaymentProductSchemaType } from '@/schemas/payment-product'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field, FieldLabel } from '../../../../../components/ui/field'

interface PaymentProductFormProps {
  onSubmit?: () => void
}

export default function PaymentProductForm({ onSubmit }: PaymentProductFormProps) {
  const form = useForm<PaymentProductSchemaType>({
    resolver: zodResolver(PaymentProductSchema),
    defaultValues: {
      productId: undefined,
      name: '',
      price: 0,
      lessonCount: 0,
    },
  })

  const handleSubmit = async (values: PaymentProductSchemaType) => {
    try {
      const data = {
        name: values.name,
        price: values.price,
        lessonCount: values.lessonCount,
        productId: undefined as number | undefined,
      }
      if (typeof values.productId === 'number') {
        data.productId = values.productId
      }

      await createPaymentProduct({ data })
      form.reset()
      toast.success('Товар успешно добавлен')
      onSubmit?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при добавлении товара')
    }
  }

  return (
    <form
      className="@container space-y-6"
      onSubmit={form.handleSubmit(handleSubmit)}
      id="payment-product-form"
    >
      <div className="grid grid-cols-12 gap-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Field className="col-span-12 flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Название товара (как в amoCRM)</FieldLabel>
              <Input placeholder="Например: Пакет 10 занятий" type="text" {...field} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="price"
          render={({ field }) => (
            <Field className="col-span-6 flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Цена (₽)</FieldLabel>
              <Input
                placeholder="5000"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                {...field}
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
          name="lessonCount"
          render={({ field }) => (
            <Field className="col-span-6 flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Кол-во занятий</FieldLabel>
              <Input
                placeholder="10"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                {...field}
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
          name="productId"
          render={({ field }) => (
            <Field className="col-span-12 flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">ID товара из amoCRM (необязательно)</FieldLabel>
              <Input
                placeholder="123456789"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                {...field}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '') {
                    field.onChange(undefined)
                    return
                  }
                  const n = Number(v)
                  if (Number.isFinite(n)) field.onChange(n)
                }}
              />
            </Field>
          )}
        />
      </div>
    </form>
  )
}
