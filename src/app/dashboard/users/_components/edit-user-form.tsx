'use client'

import { Input } from '@/components/ui/input'
import { Controller, useForm } from 'react-hook-form'

import { updateUser } from '@/actions/users'
import { Field, FieldLabel } from '@/components/ui/field'
import { EditUserSchema, EditUserSchemaType } from '@/schemas/user'
import { UserDTO } from '@/types/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

interface UserFormProps {
  user: UserDTO
  onSubmit?: () => void
}

export default function EditUserForm({ user, onSubmit }: UserFormProps) {
  const form = useForm<EditUserSchemaType>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || '',
      roleId: user.roleId,
      status: user.status,
      bidForLesson: user.bidForLesson,
      bidForIndividual: user.bidForIndividual,
    },
  })

  async function handleSubmit(values: EditUserSchemaType) {
    const ok = updateUser({
      where: {
        id: user.id,
      },
      data: {
        firstName: values.firstName,
        lastName: values.lastName,
        roleId: values.roleId,
        status: values.status,
        bidForLesson: values.bidForLesson,
        bidForIndividual: values.bidForIndividual,
      },
    })

    toast.promise(ok, {
      loading: 'Создание пользователя...',
      success: 'Пользователь успешно создан',
      error: (e) => e.message || 'Ошибка при создании пользователя',
    })

    try {
      await ok
      form.reset()
      onSubmit?.()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form
      className="@container space-y-6"
      onSubmit={form.handleSubmit(handleSubmit)}
      id="user-form"
    >
      <div className="grid grid-cols-12 gap-4">
        <Controller
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <Field className="col-span-12 flex flex-col items-start gap-2 space-y-0">
              <FieldLabel>Имя</FieldLabel>
              <Input placeholder="Введите имя" type="text" {...field} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <Field className="col-span-12 flex flex-col items-start gap-2 space-y-0">
              <FieldLabel>Фамилия</FieldLabel>
              <Input placeholder="Введите фамилию" type="text" {...field} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <Field className="col-span-12 flex flex-col items-start gap-2 space-y-0">
              <FieldLabel>Роль</FieldLabel>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Field className="col-span-12 flex flex-col items-start gap-2 space-y-0">
              <FieldLabel>Статус</FieldLabel>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="bidForLesson"
          render={({ field }) => (
            <Field className="col-span-12 flex flex-col items-start gap-2 space-y-0">
              <FieldLabel>Ставка за групповой урок</FieldLabel>
              <Input
                placeholder="1100"
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="bidForIndividual"
          render={({ field }) => (
            <Field className="col-span-12 flex flex-col items-start gap-2 space-y-0">
              <FieldLabel>Ставка за индивидуальный урок</FieldLabel>
              <Input
                placeholder="750"
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
      </div>
    </form>
  )
}
