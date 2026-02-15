import { Prisma } from '@/prisma/generated/client'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, MoreVertical, Pen } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { updateUser } from '@/src/actions/users'
import { memberRoleLabels } from '@/src/components/sidebar/nav-user'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Input } from '@/src/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/src/components/ui/sheet'
import { useIsMobile } from '@/src/hooks/use-mobile'
import { OrganizationRole } from '@/src/lib/auth'
import { authClient } from '@/src/lib/auth-client'
import { toast } from 'sonner'

interface UsersActionsProps {
  member: Prisma.MemberGetPayload<{ include: { user: true } }>
}

const EditUserSchema = z.object({
  firstName: z.string().min(2, 'Укажите имя'),
  lastName: z.string().optional(),
  role: z.object(
    {
      label: z.string(),
      value: z.string(),
    },
    'Выберите роль'
  ),
  bidForLesson: z
    .number('Укажите корректную ставку за урок')
    .positive('Ставка должна быть положительной'),
  bidForIndividual: z
    .number('Укажите корректную ставку за индивидуальное занятие')
    .positive('Ставка должна быть положительной'),
  banned: z.boolean(),
  isApplyToLessons: z.boolean(),
})

type EditUserSchemaType = z.infer<typeof EditUserSchema>

const mappedRoles = [
  { label: 'Менеджер', value: 'manager' },
  { label: 'Учитель', value: 'teacher' },
]

export default function UsersActions({ member }: UsersActionsProps) {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const isMobile = useIsMobile()
  const [isPending, startTransition] = useTransition()

  const form = useForm<EditUserSchemaType>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: {
      firstName: member.user.name?.split(' ')[0] || '',
      lastName: member.user.name?.split(' ').slice(1).join(' ') || undefined,
      role: member.user.role
        ? { label: memberRoleLabels[member.role as OrganizationRole], value: member.role }
        : undefined,
      bidForLesson: member.user.bidForLesson,
      bidForIndividual: member.user.bidForIndividual,
      isApplyToLessons: false,
      banned: member.user.banned !== null ? member.user.banned : undefined,
    },
  })

  const onSubmit = (values: EditUserSchemaType) => {
    startTransition(() => {
      const { role, isApplyToLessons, firstName, lastName, ...payload } = values
      const ok = updateUser(
        {
          where: { id: member.user.id },
          data: {
            ...payload,
            name: `${firstName} ${lastName || ''}`.trim(),
          },
        },
        isApplyToLessons
      ).then(() => {
        authClient.organization.updateMemberRole({
          memberId: member.id.toString(),
          role: role.value,
        })
      })
      toast.promise(ok, {
        loading: 'Обновление пользователя...',
        success: 'Пользователь успешно обновлен!',
        error: 'Не удалось обновить пользователя. Пожалуйста, попробуйте еще раз.',
        finally: () => {
          setEditOpen(false)
        },
      })
    })
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-max">
          <DropdownMenuItem
            onClick={() => {
              setEditOpen(true)
              setOpen(false)
            }}
          >
            <Pen />
            Редактировать
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className="data-[side=bottom]:max-h-[70vh]"
        >
          <SheetHeader>
            <SheetTitle>Редактировать</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id="edit-user-form"
            className="no-scrollbar overflow-y-auto px-4"
          >
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
                name="banned"
                disabled={isPending}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="banned-field">Статус</FieldLabel>
                    <Select
                      {...field}
                      value={field.value}
                      itemToStringLabel={(itemValue) => (itemValue ? 'Неактивен' : 'Активен')}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="banned-field" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem key={1} value={false}>
                            Активен
                          </SelectItem>
                          <SelectItem key={0} value={true}>
                            Неактивен
                          </SelectItem>
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
                          Ставки за групповой и индивидуальный урок будут применены ко всем группам
                          и будущим урокам.
                        </TooltipContent>
                      </Tooltip>
                    </FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
          <SheetFooter className="border-t px-6 py-4">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button form="edit-user-form" type="submit">
              Подтвердить
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
