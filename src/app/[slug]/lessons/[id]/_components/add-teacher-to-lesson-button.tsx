'use client'
import { Prisma } from '@/prisma/generated/client'
import { createTeacherLesson } from '@/src/actions/lessons'
import { CustomCombobox } from '@/src/components/custom-combobox'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useSessionQuery } from '@/src/data/user/session-query'
import { useMemberListQuery } from '@/src/features/organization/members/queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { memberRoleLabels } from '@/src/components/sidebar/nav-user'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/src/components/ui/item'
import { OrganizationRole } from '@/src/lib/auth/server'
import {
  AddTeacherToLessonSchema,
  AddTeacherToLessonSchemaType,
} from '@/src/schemas/teacher-lesson'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AddTeacherToLessonButtonProps {
  lesson: Prisma.LessonGetPayload<{
    include: {
      group: {
        include: {
          groupType: {
            include: {
              rate: true
            }
          }
        }
      }
    }
  }>
}

export default function AddTeacherToLessonButton({ lesson }: AddTeacherToLessonButtonProps) {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.organizationId ?? undefined
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<AddTeacherToLessonSchemaType>({
    resolver: zodResolver(AddTeacherToLessonSchema),
    defaultValues: {
      teacherId: undefined,
      bid: lesson.group.groupType?.rate?.bid ?? undefined,
      bonusPerStudent: lesson.group.groupType?.rate?.bonusPerStudent ?? undefined,
    },
  })

  const handleSubmit = (data: AddTeacherToLessonSchemaType) => {
    startTransition(() => {
      const { teacherId, bid, bonusPerStudent, ...payload } = data
      const ok = createTeacherLesson({
        data: {
          organizationId: organizationId!,
          lessonId: lesson.id,
          teacherId: Number(teacherId),
          bid: Number(bid),
          bonusPerStudent: Number(bonusPerStudent),
          ...payload,
        },
      })
      toast.promise(ok, {
        loading: 'Добавление преподавателя...',
        success: 'Преподаватель успешно добавлен в группу!',
        error: 'Не удалось добавить преподавателя в группу.',
        finally: () => setDialogOpen(false),
      })
    })
  }

  useEffect(() => {
    form.reset()
  }, [dialogOpen, form])

  if (isSessionLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button size={'icon'} />}>
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить преподавателя</DialogTitle>
        </DialogHeader>

        <LessonTeacherForm form={form} onSubmit={handleSubmit} />

        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" form="lesson-teacher-form">
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface LessonTeacherFormProps {
  form: ReturnType<typeof useForm<AddTeacherToLessonSchemaType>>
  onSubmit: (data: AddTeacherToLessonSchemaType) => void
}

function LessonTeacherForm({ form, onSubmit }: LessonTeacherFormProps) {
  const { data: members, isLoading: isMembersLoading } = useMemberListQuery()

  if (isMembersLoading) {
    return <Skeleton className="h-full w-full" />
  }
  if (!members) {
    return (
      <div className="h-full w-full">
        <p>Не найдены преподаватели</p>
      </div>
    )
  }
  return (
    <form id="lesson-teacher-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="teacherId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-teacher">Преподаватель</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <CustomCombobox
                id="form-rhf-select-teacher"
                items={members || []}
                getKey={(m) => m.user.id}
                getLabel={(m) => m.user.name}
                value={members?.find((m) => m.user.id === field.value) || null}
                onValueChange={(m) => m && field.onChange(m.user.id)}
                placeholder="Выберите преподавателя"
                emptyText="Не найдены преподаватели"
                renderItem={(m) => (
                  <Item size="xs" className="p-0">
                    <ItemContent>
                      <ItemTitle className="whitespace-nowrap">{m.user.name}</ItemTitle>
                      <ItemDescription>
                        <span>{memberRoleLabels[m.role as OrganizationRole]}</span>
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                )}
              />
            </Field>
          )}
        />

        <Controller
          name="bid"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-input-bid">Ставка</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                id="form-rhf-input-bid"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
        <Controller
          name="bonusPerStudent"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-input-bonusPerStudent">Бонус за ученика</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                id="form-rhf-input-bonusPerStudent"
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
