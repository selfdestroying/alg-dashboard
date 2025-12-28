'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DefaultValues, useForm } from 'react-hook-form'

import { createUser } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { UserSchema, UserSchemaType } from '@/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { Role } from '@prisma/client'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface UserFormProps {
  defaultValues?: DefaultValues<UserSchemaType>
  onSubmit?: () => void
}

export default function UserForm({ defaultValues, onSubmit }: UserFormProps) {
  const form = useForm<UserSchemaType>({
    resolver: zodResolver(UserSchema),
    defaultValues: defaultValues || {
      firstName: '',
      lastName: '',
      password: '',
      role: 'TEACHER',
      passwordRequired: true,
      bidForLesson: 1100,
      bidForIndividual: 750,
    },
  })

  async function handleSubmit(values: UserSchemaType) {
    const promise = createUser({
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
      role: values.role,
      passwordRequired: values.passwordRequired,
      bidForLesson: values.bidForLesson,
      bidForIndividual: values.bidForIndividual,
    })

    toast.promise(promise, {
      loading: 'Создание пользователя...',
      success: 'Пользователь успешно создан',
      error: (e) => e.message || 'Ошибка при создании пользователя',
    })

    try {
      await promise
      form.reset()
      onSubmit?.()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form
        className="@container space-y-6"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="user-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="col-span-12 flex flex-col items-start gap-2 space-y-0">
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input placeholder="Введите имя" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="col-span-12 flex flex-col items-start gap-2 space-y-0">
                <FormLabel>Фамилия</FormLabel>
                <FormControl>
                  <Input placeholder="Введите фамилию" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="col-span-12 flex flex-col items-start gap-2 space-y-0">
                <div className="flex w-full items-center justify-between">
                  <FormLabel>Пароль</FormLabel>
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
                <FormControl>
                  <Input placeholder="Введите пароль" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="col-span-12 flex flex-col items-start gap-2 space-y-0">
                <FormLabel>Роль</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Role.MANAGER}>Менеджер</SelectItem>
                    <SelectItem value={Role.TEACHER}>Преподаватель</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bidForLesson"
            render={({ field }) => (
              <FormItem className="col-span-12 flex flex-col items-start gap-2 space-y-0">
                <FormLabel>Ставка за групповой урок</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1100"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bidForIndividual"
            render={({ field }) => (
              <FormItem className="col-span-12 flex flex-col items-start gap-2 space-y-0">
                <FormLabel>Ставка за индивидуальный урок</FormLabel>
                <FormControl>
                  <Input
                    placeholder="750"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
