'use client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

import { createStudent } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreateStudentSchema, CreateStudentSchemaType } from '@/schemas/student'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function CreateStudentDialog() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<CreateStudentSchemaType>({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: 0,
      parentsName: '',
      crmUrl: '',
      login: '',
      password: '',
      coins: 0,
    },
  })

  const onSubmit = (data: CreateStudentSchemaType) => {
    startTransition(() => {
      const ok = createStudent(data)

      toast.promise(ok, {
        loading: 'Создание ученика...',
        success: 'Ученик успешно создан!',
        error: 'Ошибка при создании ученика.',
        finally: () => {
          setDialogOpen(false)
          form.reset()
        },
      })
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="create-student-form">
        <DialogTrigger render={<Button />}>Создать ученика</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать ученика</DialogTitle>
            <DialogDescription>
              Заполните форму ниже, чтобы создать нового ученика.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="no-scrollbar max-h-[60vh] overflow-y-auto">
            <Controller
              control={form.control}
              name="firstName"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="firstName-field">Имя</FieldLabel>
                  <Input id="firstName-field" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="lastName"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="lastName-field">Фамилия</FieldLabel>
                  <Input id="lastName-field" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="age"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="age-field">Возраст</FieldLabel>
                  <Input
                    id="age-field"
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="crmUrl"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="crmUrl-field">CRM URL</FieldLabel>
                  <Input id="crmUrl-field" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="parentsName"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="parentsName-field">ФИО Родителя</FieldLabel>
                  <Input id="parentsName-field" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="login"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="login-field">Логин</FieldLabel>
                  <Input id="login-field" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <div className="flex w-full items-center justify-between">
                    <FieldLabel htmlFor="password-field">Пароль</FieldLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => form.setValue('password', crypto.randomUUID().slice(0, 8))}
                      className="h-auto px-2 py-1 text-xs"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Сгенерировать
                    </Button>
                  </div>
                  <Input id="password-field" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="coins"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="coins-field">Коины</FieldLabel>
                  <Input
                    id="coins-field"
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Отмена</DialogClose>
            <Button type="submit" form="create-student-form" disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
