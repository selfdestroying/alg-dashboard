'use client'
import { Prisma } from '@/prisma/generated/client'
import { dismissStudentFromGroup, transferStudentToGroup } from '@/src/actions/groups'
import { CustomCombobox } from '@/src/components/custom-combobox'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/src/components/ui/item'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useSessionQuery } from '@/src/data/user/session-query'
import { useGroupListQuery } from '@/src/features/groups/queries'
import { cn, getGroupName } from '@/src/lib/utils'
import { DismissStudentSchema, DismissStudentSchemaType } from '@/src/schemas/dismissed'
import { TransferStudentSchema, TransferStudentSchemaType } from '@/src/schemas/transfer'
import { zodResolver } from '@hookform/resolvers/zod'
import { ru } from 'date-fns/locale'
import { CalendarIcon, DoorOpen, GitCompare, MoreVertical, TriangleAlert } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface UsersActionsProps {
  sg: Prisma.StudentGroupGetPayload<{ include: { student: true } }>
}

export default function GroupStudentActions({ sg }: UsersActionsProps) {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const [open, setOpen] = useState(false)
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { data: groups, isLoading: isGroupsLoading } = useGroupListQuery()

  const dismissForm = useForm<DismissStudentSchemaType>({
    resolver: zodResolver(DismissStudentSchema),
    defaultValues: {
      date: undefined,
      comment: undefined,
    },
  })
  const transferForm = useForm<TransferStudentSchemaType>({
    resolver: zodResolver(TransferStudentSchema),
    defaultValues: {
      groupId: undefined,
    },
  })

  const handleDismiss = (values: DismissStudentSchemaType) => {
    startTransition(() => {
      const ok = dismissStudentFromGroup({
        studentId: sg.student.id,
        groupId: sg.groupId,
        dismissComment: values.comment,
        dismissedAt: values.date,
      })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Студент успешно переведен в отток',
        error: 'Ошибка при переводе студента в отток',
        finally: () => {
          setDismissDialogOpen(false)
          setOpen(false)
        },
      })
    })
  }

  const handleTransfer = (values: TransferStudentSchemaType) => {
    startTransition(() => {
      const ok = transferStudentToGroup({
        studentId: sg.student.id,
        oldGroupId: sg.groupId,
        newGroupId: values.groupId,
        organizationId: sg.organizationId,
        actorUserId: session?.user?.id ? Number(session.user.id) : 0,
      })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Студент успешно переведен в другую группу',
        error: 'Ошибка при переводе студента в другую группу',
        finally: () => {
          setTransferDialogOpen(false)
          setOpen(false)
        },
      })
    })
  }

  useEffect(() => {
    dismissForm.reset()
  }, [dismissForm, dismissDialogOpen])

  if (isSessionLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-max">
          <DropdownMenuItem
            onClick={() => {
              setDismissDialogOpen(true)
              setOpen(false)
            }}
          >
            <DoorOpen />
            Перевести в отток
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTransferDialogOpen(true)
              setOpen(false)
            }}
          >
            <GitCompare />
            Перевести в группу
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Перевести в отток</DialogTitle>
            <DialogDescription>
              Укажите дату отчисления и комментарий (необязательно)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={dismissForm.handleSubmit(handleDismiss)} id="dismiss-form">
            <FieldGroup>
              <Controller
                control={dismissForm.control}
                name="date"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Дата отчисления</FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={<Button variant="outline" className="w-full font-normal" />}
                      >
                        <CalendarIcon />
                        {field.value
                          ? field.value.toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                            })
                          : 'Выберите день'}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          onSelect={field.onChange}
                          locale={ru}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                )}
              />

              <Controller
                control={dismissForm.control}
                name="comment"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Комментарий</FieldLabel>
                    <Input type="text" {...field} value={field.value ?? ''} />
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <Alert>
            <TriangleAlert />
            <AlertDescription>
              Неотмеченные записи посещаемости в текущей группе будут удалены.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <DialogClose render={<Button variant="secondary" size={'sm'} />}>Отмена</DialogClose>
            <Button type="submit" size={'sm'} form="dismiss-form" disabled={isPending}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Перевести</DialogTitle>
            <DialogDescription>
              Выберите группу для перевода. Кошелёк будет автоматически привязан к новой группе.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={transferForm.handleSubmit(handleTransfer)} id="transfer-form">
            <FieldGroup>
              <Controller
                control={transferForm.control}
                name="groupId"
                render={({ field, fieldState }) => (
                  <Field>
                    <CustomCombobox
                      items={groups || []}
                      getKey={(g) => g.id}
                      getLabel={(g) => getGroupName(g)}
                      value={groups?.find((g) => g.id === field.value) || null}
                      onValueChange={(g) => g && field.onChange(g.id)}
                      placeholder="Выберите группу для перевода"
                      emptyText="Не найдены группы"
                      itemDisabled={(g) => g.students.length >= g.maxStudents}
                      renderItem={(g) => (
                        <Item size="xs" className="p-0">
                          <ItemContent>
                            <ItemTitle className="whitespace-nowrap">{getGroupName(g)}</ItemTitle>
                            <ItemDescription>
                              {g.teachers.map((t) => t.teacher.name).join(', ')} | {g.location.name}{' '}
                              |{' '}
                              <span
                                className={cn(
                                  'tabular-nums',
                                  g.students.length >= g.maxStudents && 'text-destructive',
                                )}
                              >
                                {g.students.length}/{g.maxStudents}
                              </span>
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      )}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <Alert>
            <TriangleAlert />
            <AlertDescription>
              Неотмеченные записи посещаемости в текущей группе будут удалены.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <DialogClose render={<Button variant="secondary" size={'sm'} />}>Отмена</DialogClose>
            <Button type="submit" size={'sm'} form="transfer-form" disabled={isPending}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
