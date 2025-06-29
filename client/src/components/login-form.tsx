'use client'

import type React from 'react'

import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'
import { api } from '@/lib/api/api-client'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/response'
import { IAuth } from '@/types/user'
import { createSession } from '@/lib/session'

const SignInFormSchema = z.object({
  name: z.string().min(2, { error: 'Минимальная длинна 2 символа' }).trim(),
  password: z.string().min(2, { error: 'Минимальная длинна 2 символа' }),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  })

  const onValid = (values: z.infer<typeof SignInFormSchema>) => {
    const ok = new Promise<ApiResponse<IAuth>>((resolve, reject) => {
      api
        .post<IAuth>('auth/login', {
          name: values.name,
          password: values.password,
        })
        .then((r) => {
          if (r.success) {
            createSession(r.data.token)
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
            <form onSubmit={form.handleSubmit(onValid)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root?.badRequest && (
                <FormMessage>Неверный логин или пароль</FormMessage>
              )}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" />
                    Вход...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 p-4 rounded-lg space-y-1">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs space-y-1 rounded-md p-4">
              <p>
                <strong>Username:</strong> admin
              </p>
              <p>
                <strong>Password:</strong> admin
              </p>
            </div>
            <div className="text-xs space-y-1 rounded-md p-4">
              <p>
                <strong>Username:</strong> teacher
              </p>
              <p>
                <strong>Password:</strong> teacher
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
