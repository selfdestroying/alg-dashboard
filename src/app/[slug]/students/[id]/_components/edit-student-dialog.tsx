'use client'

import { updateStudent } from '@/src/actions/students'
import { Button } from '@/src/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/src/components/ui/sheet'
import { useIsMobile } from '@/src/hooks/use-mobile'
import { getAgeFromBirthDate } from '@/src/lib/utils'
import { EditStudentSchema, EditStudentSchemaType } from '@/src/schemas/student'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Pen } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { StudentWithGroupsAndAttendance } from './types'

export default function EditStudentDialog({
  student,
}: {
  student: StudentWithGroupsAndAttendance
}) {
  const isMobile = useIsMobile()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<EditStudentSchemaType>({
    resolver: zodResolver(EditStudentSchema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName || '',
      birthDate: student.birthDate || undefined,
      parentsName: student.parentsName || undefined,
      parentsPhone: student.parentsPhone || undefined,
      url: student.url || undefined,
      login: student.login,
      password: student.password,
      coins: student.coins,
    },
  })

  const selectedBirthDate = form.watch('birthDate')
  const calculatedAge =
    selectedBirthDate instanceof Date && !isNaN(selectedBirthDate.getTime())
      ? getAgeFromBirthDate(selectedBirthDate)
      : null

  const onSubmit = (values: EditStudentSchemaType) => {
    const age = values.birthDate ? getAgeFromBirthDate(values.birthDate) : null
    startTransition(async () => {
      try {
        await updateStudent(
          {
            where: { id: student.id },
            data: {
              firstName: values.firstName,
              lastName: values.lastName,
              age,
              birthDate: values.birthDate ?? null,
              parentsName: values.parentsName ?? null,
              parentsPhone: values.parentsPhone ?? null,
              url: values.url ?? null,
              login: values.login,
              password: values.password,
              coins: values.coins,
            },
          },
          {},
        )

        toast.success('Ученик успешно обновлён!')
        setDialogOpen(false)
      } catch {
        toast.error('Ошибка при обновлении ученика.')
      }
    })
  }

  return (
    <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
      <SheetTrigger render={<Button size="icon" />}>
        <Pen />
      </SheetTrigger>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="data-[side=bottom]:max-h-[70vh]"
      >
        <SheetHeader>
          <SheetTitle>Редактировать ученика</SheetTitle>
          <SheetDescription>
            Заполните форму ниже, чтобы отредактировать данные ученика.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="create-student-form"
          className="no-scrollbar overflow-y-auto px-4"
        >
          <FieldGroup>
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
              name="birthDate"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="birthDate-field">Дата рождения</FieldLabel>
                  <Input
                    id="birthDate-field"
                    type="date"
                    {...field}
                    value={
                      field.value instanceof Date && !isNaN(field.value.getTime())
                        ? field.value.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                    }
                    aria-invalid={fieldState.invalid}
                  />
                  <p className="text-muted-foreground text-sm">Возраст: {calculatedAge ?? '—'}</p>
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
                  <Input
                    id="parentsName-field"
                    {...field}
                    value={field.value ?? ''}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="parentsPhone"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="parentsPhone-field">Телефон родителя</FieldLabel>
                  <Input
                    id="parentsPhone-field"
                    type="tel"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="url"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="url-field">Ссылка</FieldLabel>
                  <Input
                    id="url-field"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                  />
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
                  <FieldLabel htmlFor="password-field">Пароль</FieldLabel>
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
        </form>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
          <Button type="submit" form="create-student-form" disabled={isPending}>
            {isPending && <Loader className="animate-spin" />}
            Сохранить
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
