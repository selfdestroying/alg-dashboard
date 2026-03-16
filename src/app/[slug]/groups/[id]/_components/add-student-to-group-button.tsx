'use client'

import { Group, Student } from '@/prisma/generated/client'
import { createStudentGroup } from '@/src/actions/groups'
import { getStudents } from '@/src/actions/students'
import { CustomCombobox } from '@/src/components/custom-combobox'
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
import { Skeleton } from '@/src/components/ui/skeleton'
import { Switch } from '@/src/components/ui/switch'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { createWallet as createWalletAction } from '@/src/features/wallets/actions'
import { useStudentWalletsQuery, walletKeys } from '@/src/features/wallets/queries'
import { getWalletLabel } from '@/src/features/wallets/utils'
import { getFullName } from '@/src/lib/utils'
import { AddStudentToGroupSchema, AddStudentToGroupSchemaType } from '@/src/schemas/student-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AddStudentToGroupButtonProps {
  group: Group
  students?: Student[]
  excludeStudentIds?: number[]
  isFull?: boolean
}

export default function AddStudentToGroupButton({
  group,
  students: studentsProp,
  excludeStudentIds,
  isFull,
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

  const form = useForm<AddStudentToGroupSchemaType>({
    resolver: zodResolver(AddStudentToGroupSchema),
    defaultValues: {
      target: undefined,
      isApplyToLesson: true,
      walletId: undefined,
    },
  })

  const selectedTarget = form.watch('target')
  const selectedStudentId = selectedTarget?.value
  const { data: wallets } = useStudentWalletsQuery(selectedStudentId ?? -1, {
    enabled: !!selectedStudentId,
  })

  useEffect(() => {
    if (wallets?.length === 1) {
      form.setValue('walletId', wallets[0]!.id)
    }
  }, [wallets, form])

  useEffect(() => {
    if (!dialogOpen || studentsProp || !organizationId || !excludeStudentIds) return
    startTransition(() => {
      getStudents({
        where: {
          organizationId,
          NOT: { id: { in: excludeStudentIds } },
        },
      }).then((data) => {
        setLazyStudents(data as Student[])
      })
    })
  }, [dialogOpen, studentsProp, organizationId, excludeStudentIds])

  const students = studentsProp ?? lazyStudents

  const items = useMemo(() => {
    if (!students) return []
    return students.map((s) => ({
      label: getFullName(s.firstName, s.lastName),
      value: s.id,
    }))
  }, [students])

  const handleSubmit = (data: AddStudentToGroupSchemaType) => {
    if (!isCreatingNewWallet && wallets && wallets.length > 0 && !data.walletId) {
      form.setError('walletId', { message: 'Выберите кошелёк' })
      return
    }

    const { isApplyToLesson, target } = data
    const studentId = target.value

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
              groupId: group.id,
              studentId,
              status: 'ACTIVE',
              ...(walletId ? { walletId } : {}),
            },
          },
          isApplyToLesson,
        )

        toast.success('Студент успешно добавлен в группу!')
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
    form.reset({ target: undefined, isApplyToLesson: true, walletId: undefined })
    setIsCreatingNewWallet(false)
    setNewWalletName('')
  }, [dialogOpen, form])

  if (!hasPermission) return null

  if (isSessionLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <Button size={'icon'} disabled={isFull} title={isFull ? 'Группа заполнена' : undefined} />
        }
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить студента</DialogTitle>
        </DialogHeader>

        <form id="add-student-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="gap-2">
            <Controller
              name="target"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="form-rhf-select-target">Студент</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  <Combobox
                    items={items}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    isItemEqualToValue={(a, b) => a.value === b.value}
                  >
                    <ComboboxInput id="form-rhf-select-target" aria-invalid={fieldState.invalid} />
                    <ComboboxContent>
                      <ComboboxEmpty>Нет доступных студентов</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item.value} value={item}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              )}
            />

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
                              setIsCreatingNewWallet(next)
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
                        value={newWalletName}
                        onChange={(e) => setNewWalletName(e.target.value)}
                      />
                    ) : (
                      <CustomCombobox
                        items={
                          wallets?.map((w) => ({
                            label: getWalletLabel(w),
                            value: w.id.toString(),
                          })) ?? []
                        }
                        value={
                          field.value
                            ? {
                                label: (() => {
                                  const w = wallets?.find(
                                    (w) => w.id.toString() === field.value?.toString(),
                                  )
                                  return w ? getWalletLabel(w) : ''
                                })(),
                                value: field.value.toString(),
                              }
                            : null
                        }
                        onValueChange={(item) =>
                          field.onChange(item ? Number(item.value) : undefined)
                        }
                        disabled={!hasWallets}
                        id="form-rhf-select-wallet"
                        placeholder={
                          !isWalletListReady
                            ? 'Сначала выберите ученика'
                            : hasWallets
                              ? 'Выберите кошелёк'
                              : 'Нет кошельков'
                        }
                      />
                    )}
                  </Field>
                )
              }}
            />

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

        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)} size={'sm'}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" form="add-student-form" size={'sm'}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
