'use client'

import { login } from '@/actions/auth'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { signInFormSchema, SignInFormSchemaType } from '@/schemas/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { GraduationCap, Loader } from 'lucide-react'

interface GroupedUser {
  value: string
  items: {
    label: string
    value: number
  }[]
}

export default function LoginForm({ groupedUsers }: { groupedUsers: GroupedUser[] }) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<SignInFormSchemaType>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      user: undefined,
      password: '',
    },
  })

  const handleLogin = (values: SignInFormSchemaType) => {
    startTransition(() => {
      login(values).then((res) => {
        if (!res.success) {
          if (res.name === 'user' || res.name === 'password') {
            form.setError(res.name, { message: res.message })
          } else {
            form.setError('root', { message: res.message })
          }
          form.setValue('password', '')
        }
      })
    })
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(handleLogin)} id="login-form">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <GraduationCap className="h-10 w-10" />
            <h1 className="text-xl font-bold">Добро пожаловать в ...</h1>
          </div>
          <Controller
            control={form.control}
            name="user"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-field">Пользователь</FieldLabel>
                <Combobox
                  items={groupedUsers}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  isItemEqualToValue={(itemValue, selectedValue) =>
                    itemValue.value === selectedValue.value
                  }
                >
                  <ComboboxInput
                    placeholder="Выберите пользователя"
                    id="user-field"
                    required
                    aria-invalid={fieldState.invalid}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Пользователи не найдены.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxGroup key={item.value} items={item.items}>
                          <ComboboxLabel>{item.value}</ComboboxLabel>
                          <ComboboxCollection>
                            {(user) => (
                              <ComboboxItem key={user.value} value={user}>
                                {user.label}
                              </ComboboxItem>
                            )}
                          </ComboboxCollection>
                        </ComboboxGroup>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="password-field">Пароль</FieldLabel>
                <Input
                  {...field}
                  id="password-field"
                  placeholder="Пароль"
                  autoComplete="off"
                  type="password"
                  required
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {form.formState.errors.root && (
            <FieldError errors={[{ message: form.formState.errors.root.message }]} />
          )}

          <Field>
            <Button type="submit" form="login-form" disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Войти
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Войдите в аккаунт чтобы использовать все функции панели управления
      </FieldDescription>
    </>
  )
}
