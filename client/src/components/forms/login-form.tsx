'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { LogIn } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { useEffect, useState } from 'react'
import { IAuth, IUser, RoleNames } from '@/types/user'
import { apiGet, apiPost } from '@/actions/api'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { ApiResponse } from '@/types/response'
import { toast } from 'sonner'
import { createSession } from '@/actions/session'

export default function LoginForm({ users }: { users: IUser[] }) {
  const [selectedUserRole, setSelectedUserRole] = useState<RoleNames>()

  const formSchema = z.object({
    user: z.string().min(1, { message: 'This field is required' }),
    password: z.string(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const ok = new Promise<ApiResponse<IAuth>>((resolve, reject) => {
      apiPost<IAuth>('auth/login', {
        name: values.user,
        password: values.password,
      }).then((r) => {
        if (r.success) {
          createSession(r.data.token, r.data.expirationHours)
          resolve(r)
        } else {
          reject(r)
        }
      })
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }

  function onReset() {
    form.reset()
    form.clearErrors()
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Добро пожаловать</CardTitle>
          <CardDescription>
            Войдите в аккаунт чтобы использовать все функции панели управления
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <p className="text-foreground text-sm leading-4 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive">
                      Пользователь
                    </p>
                    <FormControl>
                      <Select
                        key="select-0"
                        {...field}
                        onValueChange={(value) => {
                          setSelectedUserRole(users.find((u) => u.name == value)?.role.name)
                          return field.onChange(value)
                        }}
                      >
                        <SelectTrigger className="w-full ">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.length && (
                            <>
                              <SelectGroup>
                                <SelectLabel>Администраторы</SelectLabel>
                                {users
                                  .filter((u) => u.role.name == 'Админ')
                                  .map((item) => (
                                    <SelectItem key={item.id} value={item.name}>
                                      {item.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Основатели</SelectLabel>
                                {users
                                  .filter((u) => u.role.name == 'Основатель')
                                  .map((item) => (
                                    <SelectItem key={item.id} value={item.name}>
                                      {item.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Менеджеры</SelectLabel>
                                {users
                                  .filter((u) => u.role.name == 'Менеджер')
                                  .map((item) => (
                                    <SelectItem key={item.id} value={item.name}>
                                      {item.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Учителя</SelectLabel>
                                {users
                                  .filter((u) => u.role.name == 'Учитель')
                                  .map((item) => (
                                    <SelectItem key={item.id} value={item.name}>
                                      {item.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedUserRole && selectedUserRole != 'Учитель' && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={form.formState.isSubmitting}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Войти
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
