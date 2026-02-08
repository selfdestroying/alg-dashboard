'use client'
import { Category } from '@/prisma/generated/client'
import { createProduct } from '@/src/actions/products'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Textarea } from '@/src/components/ui/textarea'
import { useSessionQuery } from '@/src/data/user/session-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Plus } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'

const AddProductSchema = z.object({
  name: z
    .string('Введите название продукта')
    .min(2, 'Название должно содержать не менее 2 символов')
    .max(50, 'Название не должно превышать 50 символов'),
  category: z.object(
    {
      label: z.string(),
      value: z.string(),
    },
    'Выберите категорию'
  ),
  price: z.number('Введите цену продукта').min(0, 'Цена не может быть отрицательной'),
  description: z
    .string('Введите описание продукта')
    .max(500, 'Описание не должно превышать 500 символов'),
  quantity: z.number('Введите количество продукта').min(1, 'Количество должно быть не менее 1'),
  image: z
    .instanceof(File, { error: 'Загрузите изображение продукта' })
    .refine(
      (file) => ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type),
      'Неверный формат файла. Допустимы: PNG, JPEG, SVG, WEBP'
    )
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Размер файла не должен превышать 10 МБ'),
})

type AddProductFormSchemaType = z.infer<typeof AddProductSchema>

export default function AddProductButton({ categories }: { categories: Category[] }) {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.members[0].organizationId
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<AddProductFormSchemaType>({
    resolver: zodResolver(AddProductSchema),
    defaultValues: {
      name: undefined,
      category: undefined,
      price: undefined,
      description: undefined,
      quantity: undefined,
      image: undefined,
    },
  })
  const onSubmit = (values: AddProductFormSchemaType) => {
    startTransition(() => {
      const { category, image, ...payload } = values
      const ok = createProduct(
        {
          data: {
            ...payload,
            categoryId: Number(category.value),
            organizationId,
          },
        },
        image
      )
      toast.promise(ok, {
        loading: 'Создание продукта...',
        success: 'Продукт успешно создан!',
        error: 'Ошибка при создании продукта.',
        finally: () => {
          form.reset()
          setDialogOpen(false)
        },
      })
    })
  }

  const mappedCategories = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id.toString(),
      })),
    [categories]
  )

  if (isSessionLoading) {
    return <Skeleton className="animate-spin" />
  }
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button size={'icon'} />}>
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить продукт</DialogTitle>
          <DialogDescription>Создайте новый продукт</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="create-product-form">
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="name-field">Название</FieldLabel>
                  <Input
                    id="name-field"
                    placeholder="Введите название продукта"
                    aria-invalid={fieldState.invalid}
                    {...field}
                    value={field.value ?? ''}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="price"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="price-field">Цена</FieldLabel>
                  <Input
                    id="price-field"
                    type="number"
                    placeholder="Введите цену продукта"
                    aria-invalid={fieldState.invalid}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="quantity"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="quantity-field">Количество</FieldLabel>
                  <Input
                    id="quantity-field"
                    type="number"
                    placeholder="Введите количество продукта"
                    aria-invalid={fieldState.invalid}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="category-field">Категория</FieldLabel>
                  <Select
                    items={mappedCategories}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    isItemEqualToValue={(itemValue, value) => itemValue.value === value.value}
                  >
                    <SelectTrigger id="category-field" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mappedCategories.map((category) => (
                          <SelectItem key={category.value} value={category}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="description-field">Описание</FieldLabel>
                  <Textarea
                    id="description-field"
                    placeholder="Введите описание продукта"
                    aria-invalid={fieldState.invalid}
                    {...field}
                    value={field.value ?? ''}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="image"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="image-field">Изображение</FieldLabel>
                  <Input
                    id="image-field"
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      field.onChange(file)
                    }}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Отмена</DialogClose>
          <Button type="submit" form="create-product-form" disabled={isPending}>
            {isPending && <Loader className="animate-spin" />}
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
