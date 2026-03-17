'use client'

import { updateStudent } from '@/src/actions/students'
import { Button } from '@/src/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/src/components/ui/field'
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

function RequiredMark() {
  return <span className="text-destructive">*</span>
}

function OptionalMark() {
  return <span className="text-muted-foreground text-xs font-normal">(необязательно)</span>
}

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
      url: student.url || '',
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
              url: values.url || null,
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
          id="edit-student-form"
          className="no-scrollbar overflow-y-auto px-4"
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="firstName"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="edit-firstName-field">
                    Имя <RequiredMark />
                  </FieldLabel>
                  <Input
                    id="edit-firstName-field"
                    placeholder="Введите имя"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
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
                  <FieldLabel htmlFor="edit-lastName-field">
                    Фамилия <RequiredMark />
                  </FieldLabel>
                  <Input
                    id="edit-lastName-field"
                    placeholder="Введите фамилию"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <FieldSeparator>Дополнительно</FieldSeparator>

            <Controller
              control={form.control}
              name="birthDate"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="edit-birthDate-field">
                    Дата рождения <OptionalMark />
                  </FieldLabel>
                  <Input
                    id="edit-birthDate-field"
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
                  <FieldDescription>
                    {calculatedAge !== null
                      ? `Возраст: ${calculatedAge}`
                      : 'Допустимый возраст: 6–17 лет'}
                  </FieldDescription>
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
                  <FieldLabel htmlFor="edit-url-field">
                    Ссылка <OptionalMark />
                  </FieldLabel>
                  <Input
                    id="edit-url-field"
                    placeholder="https://"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  <FieldDescription>Профиль в соцсетях или мессенджере</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
          <Button type="submit" form="edit-student-form" disabled={isPending}>
            {isPending && <Loader className="animate-spin" />}
            Сохранить
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
