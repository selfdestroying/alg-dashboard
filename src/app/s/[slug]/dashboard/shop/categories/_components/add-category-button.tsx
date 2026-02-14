'use client'
import { createCategory } from '@/src/actions/categories'
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
import { Skeleton } from '@/src/components/ui/skeleton'
import { useSessionQuery } from '@/src/data/user/session-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'

const AddCategorySchema = z.object({
  name: z
    .string('Введите название категории')
    .min(2, 'Название должно содержать не менее 2 символов')
    .max(50, 'Название не должно превышать 50 символов'),
})

type AddCategoryFormSchemaType = z.infer<typeof AddCategorySchema>

export default function AddCategoryButton() {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.organizationId ?? undefined
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<AddCategoryFormSchemaType>({
    resolver: zodResolver(AddCategorySchema),
    defaultValues: {
      name: undefined,
    },
  })
  const onSubmit = (values: AddCategoryFormSchemaType) => {
    startTransition(() => {
      const ok = createCategory({ data: { ...values, organizationId } })
      toast.promise(ok, {
        loading: 'Создание категории...',
        success: 'Категория успешно создана!',
        error: 'Ошибка при создании категории.',
        finally: () => {
          form.reset()
          setDialogOpen(false)
        },
      })
    })
  }

  if (isSessionLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button size={'icon'} />}>
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить категорию</DialogTitle>
          <DialogDescription>Создайте новую категорию для продуктов</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="create-category-form">
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="name-field">Название</FieldLabel>
                  <Input
                    id="name-field"
                    placeholder="Введите название категории"
                    {...field}
                    value={field.value ?? ''}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Отмена</DialogClose>
          <Button type="submit" form="create-category-form" disabled={isPending}>
            {isPending && <Loader className="animate-spin" />}
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
