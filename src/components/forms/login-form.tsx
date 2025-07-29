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
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'

import { sigin } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { useData } from '@/providers/data-provider'
import { signInFormSchema } from '@/schemas/auth'
import { User } from '@prisma/client'
import { LogIn } from 'lucide-react'
import { useActionState, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export default function LoginForm() {
  const { users } = useData()
  const [selectedUserRole, setSelectedUserRole] = useState<User['role']>()
  const [state, action] = useActionState(sigin, undefined)

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      user: '',
      password: '',
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Добро пожаловать</CardTitle>
          <CardDescription>
            Войдите в аккаунт чтобы использовать все функции панели управления
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={action} className="space-y-4">
              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <p className="text-foreground data-[error=true]:text-destructive text-sm leading-4 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                      Пользователь
                    </p>
                    <FormControl>
                      <Select
                        key="select-0"
                        {...field}
                        onValueChange={(value) => {
                          setSelectedUserRole(users.find((u) => u.firstName == value)?.role)
                          return field.onChange(value)
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.length && (
                            <>
                              <SelectGroup>
                                <SelectLabel>Администраторы</SelectLabel>
                                {users
                                  .filter((u) => u.role == 'ADMIN')
                                  .map((item) => (
                                    <SelectItem key={item.id} value={item.firstName}>
                                      {item.firstName}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Основатели</SelectLabel>
                                {users
                                  .filter((u) => u.role == 'OWNER')
                                  .map((item) => (
                                    <SelectItem key={item.id} value={item.firstName}>
                                      {item.firstName}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Менеджеры</SelectLabel>
                                {users
                                  .filter((u) => u.role == 'MANAGER')
                                  .map((item) => (
                                    <SelectItem key={item.id} value={item.firstName}>
                                      {item.firstName}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Учителя</SelectLabel>
                                {users
                                  .filter((u) => u.role == 'TEACHER')
                                  .map((item) => (
                                    <SelectItem key={item.id} value={item.firstName}>
                                      {item.firstName}
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem
                    className="space-y-1"
                    hidden={!selectedUserRole || selectedUserRole == 'TEACHER'}
                  >
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={form.formState.isSubmitting}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Button>
              {!state?.success && <p>{state?.message}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
