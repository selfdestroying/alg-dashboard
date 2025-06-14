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
import { signin } from '@/app/actions/auth'

const SignInFormSchema = z.object({
  username: z.string().min(2, { error: 'Name must be at least 2 characters long.' }).trim(),
  password: z.string().min(2, { error: 'Password must be at least 2 characters long.' }),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onValid = async (values: z.infer<typeof SignInFormSchema>) => {
    const user = await signin(values.username, values.password)
    if (!user) {
      form.setError('root.badRequest', { type: '400' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onValid)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
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
                <FormMessage>Invalid username or password</FormMessage>
              )}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-1">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs space-y-1 bg-gray-200 rounded-md p-4">
              <p>
                <strong>Username:</strong> admin
              </p>
              <p>
                <strong>Password:</strong> admin
              </p>
            </div>
            <div className="text-xs space-y-1 bg-gray-200 rounded-md p-4">
              <p>
                <strong>Username:</strong> user
              </p>
              <p>
                <strong>Password:</strong> user
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
