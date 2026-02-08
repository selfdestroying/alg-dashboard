'use client'

import { Button } from '@/src/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { authClient } from '@/src/lib/auth-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const signUpSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    passwordConfirmation: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match.',
    path: ['passwordConfirmation'],
  })

type SignUpFormValues = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  onSuccess?: () => void | Promise<void>
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [loading, startTransition] = useTransition()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  })

  const onSubmit = (data: SignUpFormValues) => {
    startTransition(async () => {
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        bidForLesson: 0,
        bidForIndividual: 0,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message)
          },
          async onSuccess() {
            await onSuccess?.()
          },
        },
      })
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-first-name">First name</FieldLabel>
                <Input
                  {...field}
                  id="sign-up-first-name"
                  placeholder="Max"
                  aria-invalid={fieldState.invalid}
                  autoComplete="given-name"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-last-name">Last name</FieldLabel>
                <Input
                  {...field}
                  id="sign-up-last-name"
                  placeholder="Robinson"
                  aria-invalid={fieldState.invalid}
                  autoComplete="family-name"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
              <Input
                {...field}
                id="sign-up-email"
                type="email"
                placeholder="m@example.com"
                aria-invalid={fieldState.invalid}
                autoComplete="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
                <Input
                  {...field}
                  id="sign-up-password"
                  type="password"
                  placeholder="Password"
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="passwordConfirmation"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-password-confirmation">Confirm Password</FieldLabel>
                <Input
                  {...field}
                  id="sign-up-password-confirmation"
                  type="password"
                  placeholder="Confirm Password"
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create an account'}
      </Button>
    </form>
  )
}
