'use client'

import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
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
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { useIsMobile } from '@/src/hooks/use-mobile'
import { getAgeFromBirthDate } from '@/src/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ru } from 'date-fns/locale'
import { CalendarIcon, Loader, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useStudentCreateMutation } from '../queries'
import { CreateStudentSchema, CreateStudentSchemaType } from '../schemas'

const transliterateToLatin = (value: string) => {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  }

  return value
    .toLowerCase()
    .split('')
    .map((char) => map[char] ?? char)
    .join('')
}

const normalizeLogin = (value: string) =>
  transliterateToLatin(value)
    .replace(/[^a-z]/g, '')
    .trim()

export default function AddStudentButton() {
  const { data: permission } = useOrganizationPermissionQuery({ student: ['create'] })
  const isMobile = useIsMobile()
  const [dialogOpen, setDialogOpen] = useState(false)
  const createMutation = useStudentCreateMutation()

  const form = useForm<CreateStudentSchemaType>({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      login: '',
      password: '',
      birthDate: undefined,
      parentsName: undefined,
      parentsPhone: undefined,
      url: undefined,
      coins: 0,
    },
  })

  const selectedBirthDate = form.watch('birthDate')
  const calculatedAge =
    selectedBirthDate instanceof Date && !isNaN(selectedBirthDate.getTime())
      ? getAgeFromBirthDate(selectedBirthDate)
      : null

  const generateLogin = () => {
    const first = normalizeLogin(form.getValues('firstName'))
    const last = normalizeLogin(form.getValues('lastName'))
    let login = ''
    if (first) login += first
    if (last) login += last
    form.setValue('login', login, { shouldValidate: true })
  }

  const onSubmit = (values: CreateStudentSchemaType) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        form.reset()
        setDialogOpen(false)
      },
    })
  }

  if (!permission?.success) return null

  return (
    <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
      <SheetTrigger render={<Button size="icon" />}>
        <Plus />
      </SheetTrigger>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="data-[side=bottom]:max-h-[70vh]"
      >
        <SheetHeader>
          <SheetTitle>Создать ученика</SheetTitle>
          <SheetDescription>Заполните форму ниже, чтобы создать нового ученика.</SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
          id="create-student-form"
          className="no-scrollbar overflow-auto px-6 py-2"
        >
          <FieldGroup className="no-scrollbar overflow-y-auto">
            <Controller
              control={form.control}
              name="firstName"
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="birthDate-field">Дата рождения</FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={<Button variant="outline" className="w-full font-normal" />}
                    >
                      <CalendarIcon />
                      {field.value
                        ? field.value.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                          })
                        : 'Выберите день'}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        onSelect={field.onChange}
                        locale={ru}
                        selected={field.value ?? undefined}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-muted-foreground text-sm">Возраст: {calculatedAge ?? '—'}</p>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="parentsName"
              disabled={createMutation.isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="parentsName-field">ФИО Родителя</FieldLabel>
                  <Input
                    id="parentsName-field"
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
              name="parentsPhone"
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <div className="flex w-full items-center justify-between">
                    <FieldLabel htmlFor="login-field">Логин</FieldLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={createMutation.isPending}
                      onClick={generateLogin}
                      className="h-auto px-2 py-1 text-xs"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Из имени
                    </Button>
                  </div>
                  <Input id="login-field" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
          <Button type="submit" form="create-student-form" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader className="animate-spin" />}
            Создать
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
