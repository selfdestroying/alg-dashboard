'use client'

import { PasswordInput } from '@/src/components/password-input'
import { Button } from '@/src/components/ui/button'
import { Checkbox } from '@/src/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { authClient } from '@/src/lib/auth-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap, Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const signInSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean(),
})

type SignInFormValues = z.infer<typeof signInSchema>

interface SignInFormProps {
  onSuccess?: () => void | Promise<void>
  showPasswordToggle?: boolean
}

export function SignInForm({ onSuccess, showPasswordToggle = false }: SignInFormProps) {
  const [loading, startTransition] = useTransition()

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = (data: SignInFormValues) => {
    startTransition(async () => {
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        fetchOptions: {
          async onSuccess() {
            await onSuccess?.()
          },
          onError(context) {
            toast.error(context.error.message)
          },
        },
      })
    })
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <GraduationCap className="h-10 w-10" />
            <h1 className="text-xl font-bold">Добро пожаловать в ...</h1>
          </div>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-in-email">Почта</FieldLabel>
                <Input
                  {...field}
                  id="sign-in-email"
                  type="email"
                  placeholder="example@example.com"
                  aria-invalid={fieldState.invalid}
                  autoComplete="email"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field: { ref, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="sign-in-password">Пароль</FieldLabel>
                  {/* <Link
                    href="/forget-password"
                    className="text-foreground ml-auto inline-block text-xs underline"
                  >
                    Забыли пароль?
                  </Link> */}
                </div>
                {showPasswordToggle ? (
                  <PasswordInput
                    {...field}
                    ref={ref}
                    id="sign-in-password"
                    placeholder="Password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                  />
                ) : (
                  <Input
                    {...field}
                    id="sign-in-password"
                    type="password"
                    placeholder="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                  />
                )}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="rememberMe"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  id="sign-in-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel htmlFor="sign-in-remember" className="font-normal">
                  Запомнить меня
                </FieldLabel>
              </Field>
            )}
          />
        </FieldGroup>
        <Button type="submit" className="relative w-full" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Войти'}
        </Button>
      </form>
      <FieldDescription className="px-6 text-center">
        Войдите в аккаунт чтобы использовать все функции панели управления
      </FieldDescription>
    </>
  )
}
