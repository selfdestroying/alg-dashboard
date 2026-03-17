'use client'
import { Prisma } from '@/prisma/generated/client'
import { createTeacherGroup } from '@/src/actions/groups'
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/src/components/ui/field'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Switch } from '@/src/components/ui/switch'
import { useMemberListQuery } from '@/src/features/organization/members/queries'
import { useRateListQuery } from '@/src/features/organization/rates/queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { memberRoleLabels } from '@/src/components/sidebar/nav-user'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/src/components/ui/item'
import { OrganizationRole } from '@/src/lib/auth/server'
import { AddTeacherToGroupSchema, AddTeacherToGroupSchemaType } from '@/src/schemas/teacher-group'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AddTeacherToGroupButtonProps {
  group: Prisma.GroupGetPayload<{
    include: {
      groupType: {
        include: {
          rate: true
        }
      }
    }
  }>
}

export default function AddTeacherToGroupButton({ group }: AddTeacherToGroupButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const defaultRate = group.groupType ? group.groupType.rate.id : undefined

  const form = useForm<AddTeacherToGroupSchemaType>({
    resolver: zodResolver(AddTeacherToGroupSchema),
    defaultValues: {
      teacherId: undefined,
      rateId: defaultRate,
      isApplyToLesson: true,
    },
  })

  const handleSubmit = (data: AddTeacherToGroupSchemaType) => {
    startTransition(() => {
      const { isApplyToLesson, teacherId, rateId, ...payload } = data
      const ok = createTeacherGroup(
        {
          data: {
            organizationId: group.organizationId,
            groupId: group.id,
            teacherId: Number(teacherId),
            rateId: Number(rateId),
            ...payload,
          },
        },
        isApplyToLesson,
      )
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

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button size={'icon'} />}>
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить преподавателя</DialogTitle>
        </DialogHeader>

        <GroupTeacherForm form={form} onSubmit={handleSubmit} />

        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" form="group-teacher-form">
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface GroupTeacherFormProps {
  form: ReturnType<typeof useForm<AddTeacherToGroupSchemaType>>
  onSubmit: (data: AddTeacherToGroupSchemaType) => void
}

function GroupTeacherForm({ form, onSubmit }: GroupTeacherFormProps) {
  const { data: members, isLoading: isMembersLoading } = useMemberListQuery()
  const { data: rates, isLoading: isRatesLoading } = useRateListQuery()

  if (isMembersLoading || isRatesLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <form id="group-teacher-form" onSubmit={form.handleSubmit(onSubmit)}>
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
          name="rateId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-rate">Ставка</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <CustomCombobox
                id="form-rhf-select-rate"
                items={rates || []}
                getKey={(r) => r.id}
                getLabel={(r) => r.name}
                value={rates?.find((r) => r.id === field.value) || null}
                onValueChange={(r) => r && field.onChange(r.id)}
                placeholder="Выберите ставку"
                emptyText="Не найдены ставки"
                renderItem={(r) => (
                  <Item size="xs" className="p-0">
                    <ItemContent>
                      <ItemTitle className="whitespace-nowrap tabular-nums">{r.name}</ItemTitle>
                      <ItemDescription>
                        <span className="tabular-nums">
                          {r.bid} ₽ | {r.bonusPerStudent} ₽/ученик
                        </span>
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                )}
              />
            </Field>
          )}
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
                        Добавит преподавателя во все будущие уроки, привязанные к этой группе
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
