'use client'

import { Category, Prisma } from '@/prisma/generated/client'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Button } from '@/src/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/src/components/ui/combobox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Loader2, MoreVertical, Pen, Trash } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { deleteProduct, updateProduct } from '../actions'
import { UpdateProductSchema, UpdateProductSchemaType } from '../schemas'

interface ProductActionsProps {
  product: Prisma.ProductGetPayload<{ include: { category: true } }>
  categories: Category[]
}

export default function ProductActions({ product, categories }: ProductActionsProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<UpdateProductSchemaType>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || undefined,
      quantity: product.quantity,
      categoryId: product.categoryId,
      image: undefined,
    },
  })

  const handleDelete = () => {
    startTransition(() => {
      const ok = deleteProduct({ id: product.id })
      toast.promise(ok, {
        loading: 'Удаление продукта...',
        success: 'Продукт успешно удален',
        error: 'Не удалось удалить продукт',
      })
    })
  }

  const onSubmit = (values: UpdateProductSchemaType) => {
    startTransition(() => {
      const ok = updateProduct(values)
      toast.promise(ok, {
        loading: 'Обновление продукта...',
        success: 'Продукт успешно обновлен!',
        error: 'Ошибка при обновлении продукта.',
        finally: () => {
          setEditDialogOpen(false)
          form.reset()
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
    [categories],
  )
  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-max">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setEditDialogOpen(true)
                setOpen(false)
              }}
            >
              <Pen />
              Редактировать
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setConfirmOpen(true)
              setOpen(false)
            }}
          >
            <Trash />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены, что хотите удалить продукт?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит продукт и не может быть отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
              {isPending ? <Loader2 className="animate-spin" /> : 'Удалить'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать товар</DialogTitle>
            <DialogDescription>Обновите информацию о товаре</DialogDescription>
          </DialogHeader>
          <div className="relative h-12 w-12 min-w-12 overflow-hidden rounded-lg">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="50px"
            />
          </div>
          <form id="edit-category-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Название</FieldLabel>
                    <Input placeholder="Введите название категории" {...field} />
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
                name="categoryId"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="category-field">Категория</FieldLabel>
                    <Combobox
                      items={mappedCategories}
                      value={
                        mappedCategories.find(
                          (category) => category.value === field.value?.toString(),
                        ) ?? null
                      }
                      onValueChange={(item: (typeof mappedCategories)[number] | null) =>
                        item ? field.onChange(Number(item?.value)) : ''
                      }
                    >
                      <ComboboxInput
                        id="form-rhf-select-category"
                        placeholder="Выберите категорию"
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Не найдены категории</ComboboxEmpty>
                        <ComboboxList>
                          {(category: (typeof mappedCategories)[number]) => (
                            <ComboboxItem key={category.value} value={category}>
                              {category.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
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
            <Button type="submit" form="edit-category-form" disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
