'use client'
import { Group, Prisma, Student } from '@/prisma/generated/client'
import { createStudentGroup } from '@/src/actions/groups'
import { getStudents } from '@/src/actions/students'
import { Button } from '@/src/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/src/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/src/components/ui/item'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Switch } from '@/src/components/ui/switch'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { createWallet as createWalletAction } from '@/src/features/wallets/actions'
import { useStudentWalletsQuery, walletKeys } from '@/src/features/wallets/queries'
import type { WalletWithGroups } from '@/src/features/wallets/types'
import { getWalletLabel } from '@/src/features/wallets/utils'
import { cn, getFullName, getGroupName } from '@/src/lib/utils'

import { zodResolver } from '@hookform/resolvers/zod'

type GroupDTO = Prisma.GroupGetPayload<{
  include: {
    location: true
    course: true
    students: true
    schedules: true
    groupType: { include: { rate: true } }
    teachers: { include: { teacher: true } }
  }
}>

import { Plus, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'

import { AddStudentToGroupSchema, AddStudentToGroupSchemaType } from '@/src/schemas/student-group'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AddStudentToGroupButtonProps {
  students?: Student[]
  excludeStudentIds?: number[]
  group?: Group
  groups?: GroupDTO[]
  student?: Student
  isFull?: boolean
  wallets?: WalletWithGroups[]
}

export default function AddStudentToGroupButton({
  students: studentsProp,
  excludeStudentIds,
  group,
  groups,
  student,
  isFull,
  wallets,
}: AddStudentToGroupButtonProps) {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.organizationId ?? undefined
  const { data: hasPermission } = useOrganizationPermissionQuery({ studentGroup: ['create'] })
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [lazyStudents, setLazyStudents] = useState<Student[] | null>(null)
  const [isCreatingNewWallet, setIsCreatingNewWallet] = useState(false)
  const [newWalletName, setNewWalletName] = useState('')

  const isAddToGroup = !!group && (!!studentsProp || !!excludeStudentIds)
  const isAddToStudent = !!student && !!groups

  const form = useForm<AddStudentToGroupSchemaType>({
    resolver: zodResolver(AddStudentToGroupSchema),
    defaultValues: {
      target: undefined,
      isApplyToLesson: true,
      walletId: wallets?.length === 1 ? wallets[0]!.id : undefined,
    },
  })

  const selectedTarget = form.watch('target')
  const selectedStudentId = isAddToGroup ? selectedTarget?.value : undefined
  const { data: studentWallets } = useStudentWalletsQuery(selectedStudentId ?? -1, {
    enabled: isAddToGroup && !!selectedStudentId,
  })

  const effectiveWallets = isAddToGroup ? studentWallets : wallets

  // Auto-select wallet when there's only one
  useEffect(() => {
    if (effectiveWallets?.length === 1) {
      form.setValue('walletId', effectiveWallets[0]!.id)
    }
  }, [effectiveWallets, form, isAddToGroup])

  useEffect(() => {
    startTransition(() => {
      if (!dialogOpen || !isAddToGroup || studentsProp || !organizationId || !excludeStudentIds)
        return
      getStudents({
        where: {
          organizationId,
          NOT: { id: { in: excludeStudentIds } },
        },
      }).then((data) => {
        setLazyStudents(data as Student[])
      })
    })
  }, [dialogOpen, isAddToGroup, studentsProp, organizationId, excludeStudentIds])

  const students = studentsProp ?? lazyStudents

  const items = useMemo(() => {
    if (isAddToGroup && students) {
      return students.map((s) => ({
        label: getFullName(s.firstName, s.lastName),
        value: s.id,
        itemType: 'student' as const,
      }))
    }
    if (isAddToStudent && groups) {
      return groups.map((g) => ({
        label: `${getGroupName(g)}`,
        itemType: 'group' as const,
        teachers: `${g.teachers.map((t) => t.teacher.name).join(', ')}`,
        location: g.location.name,
        students: g.students.length,
        maxStudents: g.maxStudents,
        value: g.id,
        disabled: g.students.length >= g.maxStudents,
      }))
    }
    return []
  }, [isAddToGroup, isAddToStudent, students, groups])

  const handleSubmit = (data: AddStudentToGroupSchemaType) => {
    if (!isCreatingNewWallet && effectiveWallets && effectiveWallets.length > 0 && !data.walletId) {
      form.setError('walletId', { message: 'Выберите кошелёк' })
      return
    }

    const { isApplyToLesson, target } = data
    const groupId = isAddToGroup ? group!.id : target.value
    const studentId = isAddToGroup ? target.value : student!.id
    const successMessage = isAddToGroup
      ? 'Студент успешно добавлен в группу!'
      : 'Группа успешно добавлена студенту!'

    startTransition(async () => {
      try {
        let walletId = data.walletId

        if (isCreatingNewWallet) {
          const { data: newWallet, serverError } = await createWalletAction({
            studentId,
            name: newWalletName || undefined,
          })
          if (serverError || !newWallet) throw new Error('Не удалось создать кошелёк')
          walletId = newWallet.id
        }

        await createStudentGroup(
          {
            data: {
              organizationId: organizationId!,
              groupId,
              studentId,
              status: 'ACTIVE',
              ...(walletId ? { walletId } : {}),
            },
          },
          isApplyToLesson,
        )

        toast.success(successMessage)
        setDialogOpen(false)

        if (isCreatingNewWallet) {
          queryClient.invalidateQueries({ queryKey: walletKeys.byStudent(studentId) })
        }
      } catch {
        toast.error('Не удалось добавить.')
      }
    })
  }

  useEffect(() => {
    form.reset({
      target: undefined,
      isApplyToLesson: true,
      walletId: wallets?.length === 1 ? wallets[0]!.id : undefined,
    })
    setIsCreatingNewWallet(false)
    setNewWalletName('')
  }, [dialogOpen, form, wallets])

  if ((!isAddToGroup && !isAddToStudent) || !hasPermission) return null

  const isGroupFull = isAddToGroup && isFull

  const dialogTitle = isAddToGroup ? 'Добавить студента' : 'Добавить в группу'
  const label = isAddToGroup ? 'Студент' : 'Группа'
  const emptyMessage = isAddToGroup ? 'Нет доступных студентов' : 'Нет доступных групп'

  if (isSessionLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <Button
            size={'icon'}
            disabled={isGroupFull}
            title={isGroupFull ? 'Группа заполнена' : undefined}
          />
        }
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <AddEntityForm
          form={form}
          items={items}
          label={label}
          emptyMessage={emptyMessage}
          onSubmit={handleSubmit}
          wallets={effectiveWallets}
          showWalletField
          isCreatingNewWallet={isCreatingNewWallet}
          onIsCreatingNewWalletChange={setIsCreatingNewWallet}
          newWalletName={newWalletName}
          onNewWalletNameChange={setNewWalletName}
        />

        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)} size={'sm'}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" form="add-entity-form" size={'sm'}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface AddEntityFormProps {
  form: ReturnType<typeof useForm<AddStudentToGroupSchemaType>>
  items: {
    label: string
    value: number
    description?: string
    disabled?: boolean
    itemType?: 'student' | 'group'
  }[]
  label: string
  emptyMessage: string
  onSubmit: (data: AddStudentToGroupSchemaType) => void
  wallets?: WalletWithGroups[]
  showWalletField?: boolean
  isCreatingNewWallet?: boolean
  onIsCreatingNewWalletChange?: (value: boolean) => void
  newWalletName?: string
  onNewWalletNameChange?: (value: string) => void
}

function AddEntityForm({
  form,
  items,
  label,
  emptyMessage,
  onSubmit,
  wallets,
  showWalletField,
  isCreatingNewWallet,
  onIsCreatingNewWalletChange,
  newWalletName,
  onNewWalletNameChange,
}: AddEntityFormProps) {
  return (
    <form id="add-entity-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="target"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="form-rhf-select-target">{label}</FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <Combobox
                items={items}
                value={field.value || ''}
                onValueChange={field.onChange}
                isItemEqualToValue={(itemValue, selectedValue) =>
                  itemValue.value === selectedValue.value
                }
              >
                <ComboboxInput id="form-rhf-select-target" aria-invalid={fieldState.invalid} />
                <ComboboxContent>
                  <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
                        {item.itemType === 'group' ? (
                          <Item size="xs" className="p-0">
                            <ItemContent>
                              <ItemTitle className="whitespace-nowrap">{item.label}</ItemTitle>
                              <ItemDescription>
                                {item.teachers} | {item.location} |{' '}
                                <span
                                  className={cn(
                                    'tabular-nums',
                                    item.disabled && 'text-destructive',
                                  )}
                                >
                                  {item.students}/{item.maxStudents}
                                </span>
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        ) : (
                          item.label
                        )}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          )}
        />

        {showWalletField && (
          <Controller
            name="walletId"
            control={form.control}
            render={({ field, fieldState }) => {
              const hasWallets = wallets && wallets.length > 0
              const isWalletListReady = wallets !== undefined
              return (
                <Field>
                  <FieldContent>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="form-rhf-select-wallet">Кошелёк</FieldLabel>
                      {isWalletListReady && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            const next = !isCreatingNewWallet
                            onIsCreatingNewWalletChange?.(next)
                            if (next) {
                              field.onChange(undefined)
                            } else if (wallets?.length === 1) {
                              field.onChange(wallets[0]!.id)
                            }
                          }}
                        >
                          {isCreatingNewWallet ? (
                            hasWallets ? (
                              'Выбрать существующий'
                            ) : (
                              'Отмена'
                            )
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <Wallet />
                              Создать новый
                            </span>
                          )}
                        </Button>
                      )}
                    </div>
                    {fieldState.invalid && !isCreatingNewWallet && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>

                  {isCreatingNewWallet ? (
                    <Input
                      id="new-wallet-name"
                      placeholder="Название нового кошелька (необязательно)"
                      value={newWalletName ?? ''}
                      onChange={(e) => onNewWalletNameChange?.(e.target.value)}
                    />
                  ) : (
                    <Select
                      name={field.name}
                      disabled={!hasWallets}
                      value={field.value?.toString() || ''}
                      onValueChange={(value) => field.onChange(Number(value))}
                      itemToStringLabel={(v) => {
                        const w = wallets?.find((w) => w.id.toString() === v)
                        return w ? getWalletLabel(w) : ''
                      }}
                    >
                      <SelectTrigger
                        id="form-rhf-select-wallet"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue
                          placeholder={
                            !isWalletListReady
                              ? 'Сначала выберите ученика'
                              : hasWallets
                                ? 'Выберите кошелёк'
                                : 'Нет кошельков'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {wallets?.map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>
                              {getWalletLabel(w)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              )
            }}
          />
        )}

        <Controller
          name="isApplyToLesson"
          control={form.control}
          render={({ field }) => (
            <Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="toggle-apply-to-lessons">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Применить к урокам</FieldTitle>
                      <FieldDescription>
                        Добавит студента во все будущие уроки, привязанные к этой группе
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="toggle-apply-to-lessons"
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                </FieldLabel>
              </Field>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
