'use client'

import { Input } from '@/components/ui/input'
import { Controller, useForm } from 'react-hook-form'

import { updateUser } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/usePermission'
import { useData } from '@/providers/data-provider'
import { UserDTO } from '@/types/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Pen } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { z } from 'zod/v4'

interface EditUserButtonProps {
  user: UserDTO
}

const EditUserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().optional(),
  role: z.object(
    {
      label: z.string(),
      value: z.number(),
    },
    'Выберите роль'
  ),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  bidForLesson: z
    .number('Укажите корректную ставку за урок')
    .positive('Ставка должна быть положительной'),
  bidForIndividual: z
    .number('Укажите корректную ставку за индивидуальное занятие')
    .positive('Ставка должна быть положительной'),
  isApplyToLessons: z.boolean(),
})

type EditUserSchemaType = z.infer<typeof EditUserSchema>

export default function EditUserButton({ user }: EditUserButtonProps) {
  const { roles } = useData()
  const canEdit = usePermission('EDIT_USER')
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<EditUserSchemaType>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || undefined,
      role: { label: user.role.name, value: user.role.id },
      bidForLesson: user.bidForLesson,
      bidForIndividual: user.bidForIndividual,
      isApplyToLessons: false,
      status: user.status,
    },
  })

  const onSubmit = (values: EditUserSchemaType) => {
    startTransition(() => {
      const { role, isApplyToLessons, ...payload } = values
      const ok = updateUser(
        {
          where: { id: user.id },
          data: {
            roleId: role.value,
            ...payload,
          },
        },
        isApplyToLessons
      )
      toast.promise(ok, {
        loading: 'Обновление пользователя...',
        success: 'Пользователь успешно обновлен!',
        error: 'Не удалось обновить пользователя. Пожалуйста, попробуйте еще раз.',
        finally: () => {
          setDialogOpen(false)
        },
      })
    })
  }

  const mappedRoles = useMemo(
    () =>
      roles.map((role) => ({
        label: role.name,
        value: role.id,
      })),
    [roles]
  )

  if (!canEdit) {
    return null
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <Button size={'icon'}>
            <Pen />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
          <DialogDescription>Измените информацию о пользователе ниже.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))} id="edit-user-form">
          <FieldGroup>
            <Controller
              control={form.control}
              name="firstName"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Имя</FieldLabel>
                  <Input
                    placeholder="Введите имя"
                    type="text"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="lastName"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Фамилия</FieldLabel>
                  <Input
                    placeholder="Введите фамилию"
                    type="text"
                    {...field}
                    value={field.value ?? ''}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="role"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="roleId-field">Роль</FieldLabel>
                  <Select
                    {...field}
                    items={mappedRoles}
                    value={field.value}
                    onValueChange={field.onChange}
                    isItemEqualToValue={(itemValue, value) => itemValue.value == value.value}
                  >
                    <SelectTrigger id="roleId-field" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mappedRoles.map((role) => (
                          <SelectItem key={role.value} value={role}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="status"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="status-field">Статус</FieldLabel>
                  <Select
                    {...field}
                    value={field.value}
                    onValueChange={field.onChange}
                    itemToStringLabel={(itemValue) =>
                      itemValue === 'ACTIVE' ? 'Активен' : 'Неактивен'
                    }
                  >
                    <SelectTrigger id="status-field" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ACTIVE">Активен</SelectItem>
                        <SelectItem value="INACTIVE">Неактивен</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="bidForLesson"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Ставка за групповой урок</FieldLabel>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="bidForIndividual"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Ставка за индивидуальный урок</FieldLabel>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="isApplyToLessons"
              render={({ field, fieldState }) => (
                <Field orientation={'horizontal'}>
                  <Checkbox
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldLabel>
                    <span>Применить ставки к группам и урокам</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle
                          className="text-warning h-4 w-4 cursor-help"
                          aria-label="Бета"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        Ставки за групповой и индивидуальный урок будут применены ко всем группам и
                        будущим урокам.
                      </TooltipContent>
                    </Tooltip>
                  </FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)} size={'sm'}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" form="edit-user-form" size={'sm'}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
