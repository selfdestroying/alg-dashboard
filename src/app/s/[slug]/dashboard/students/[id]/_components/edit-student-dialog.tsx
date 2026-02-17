'use client'
import { Student } from '@/prisma/generated/client'
import { StudentLessonsBalanceChangeReason } from '@/prisma/generated/enums'

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
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Pen, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod/v4'

export const EditStudentSchema = z.object({
  firstName: z.string('Укажите имя').min(2, 'Укажите имя'),
  lastName: z.string('Укажите фамилию').min(2, 'Укажите фамилию'),
  age: z
    .number('Укажите возраст')
    .gte(6, 'Укажите возраст не менее 6')
    .lte(17, 'Укажите возраст не более 17'),
  parentsName: z.string('Укажите имя родителя').min(2, 'Укажите имя родителя'),
  url: z.url('Укажите корректный URL'),
  // optional
  login: z.string('Укажите логин').min(2, 'Укажите логин'),
  password: z.string('Укажите пароль').min(2, 'Укажите пароль'),
  coins: z.number('Укажите количество монет').optional(),
  lessonsBalance: z.number('Укажите баланс уроков').optional(),
  totalPayments: z.number('Укажите сумму всех оплат').optional(),
  totalLessons: z.number('Укажите количество всех уроков').optional(),
})

export type EditStudentSchemaType = z.infer<typeof EditStudentSchema>

export default function EditStudentDialog({ student }: { student: Student }) {
  const isMobile = useIsMobile()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<EditStudentSchemaType>({
    resolver: zodResolver(EditStudentSchema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName || '',
      age: student.age || undefined,
      parentsName: student.parentsName || '',
      url: student.url || '',
      login: student.login,
      password: student.password,
      coins: student.coins,
      lessonsBalance: student.lessonsBalance,
      totalPayments: student.totalPayments,
      totalLessons: student.totalLessons,
    },
  })

  const onSubmit = (values: EditStudentSchemaType) => {
    startTransition(() => {
      const ok = updateStudent(
        {
          where: { id: student.id },
          data: {
            ...values,
          },
        },
        {
          lessonsBalance: {
            reason: StudentLessonsBalanceChangeReason.MANUAL_SET,
            meta: {
              source: 'edit-student-dialog',
            },
          },
        }
      )

      toast.promise(ok, {
        loading: 'Создание ученика...',
        success: 'Ученик успешно создан!',
        error: 'Ошибка при создании ученика.',
        finally: () => {
          setDialogOpen(false)
        },
      })
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
              name="age"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="age-field">Возраст</FieldLabel>
                  <Input
                    id="age-field"
                    {...field}
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
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

            <Controller
              control={form.control}
              name="lessonsBalance"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="lessonsBalance-field">Баланс уроков</FieldLabel>
                  <Input
                    id="lessonsBalance-field"
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
              name="totalPayments"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="totalPayments-field">Сумма всех оплат</FieldLabel>
                  <Input
                    id="totalPayments-field"
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
              name="totalLessons"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="totalLessons-field">Всего уроков</FieldLabel>
                  <Input
                    id="totalLessons-field"
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
