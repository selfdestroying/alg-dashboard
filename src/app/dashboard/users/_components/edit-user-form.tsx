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
import { useForm } from 'react-hook-form'

import { updateUser, UserData } from '@/actions/users'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/providers/data-provider'
import { EditUserSchema, EditUserSchemaType } from '@/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { Role, UserStatus } from '@prisma/client'
import { toast } from 'sonner'

interface UserFormProps {
  user: UserData
  onSubmit?: () => void
}

export default function EditUserForm({ user, onSubmit }: UserFormProps) {
  const { user: me } = useData()
  const form = useForm<EditUserSchemaType>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || '',
      role: user.role,
      status: user.status,
      passwordRequired: true,
      bidForLesson: user.bidForLesson,
      bidForIndividual: user.bidForIndividual,
    },
  })

  async function handleSubmit(values: EditUserSchemaType) {
    const ok = updateUser(
      {
        where: {
          id: user.id,
        },
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.role,
          status: values.status,
          passwordRequired: values.passwordRequired,
          bidForLesson: values.bidForLesson,
          bidForIndividual: values.bidForIndividual,
        },
      },
      '/dashboard/users'
    )

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
    <Form {...form}>
      <form
        className="@container space-y-6"
        onSubmit={form.handleSubmit(handleSubmit, (e) => console.log('errors', e))}
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

          {me?.role === 'ADMIN' ||
            (me?.role === 'OWNER' && (
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
                        <SelectItem value={Role.ADMIN}>Администратор</SelectItem>
                        <SelectItem value={Role.OWNER}>Владелец</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="col-span-12 flex flex-col items-start gap-2 space-y-0">
                <FormLabel>Статус</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserStatus.ACTIVE}>Активен</SelectItem>
                    <SelectItem value={UserStatus.INACTIVE}>Неактивен</SelectItem>
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
