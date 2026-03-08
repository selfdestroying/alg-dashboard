'use client'

import { updateGroupSchedule } from '@/src/actions/groups'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Toggle } from '@/src/components/ui/toggle'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { UpdateScheduleSchema, UpdateScheduleSchemaType } from '@/src/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCog } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

const WEEKDAYS = [
  { dayOfWeek: 1, label: 'Пн', fullLabel: 'Понедельник' },
  { dayOfWeek: 2, label: 'Вт', fullLabel: 'Вторник' },
  { dayOfWeek: 3, label: 'Ср', fullLabel: 'Среда' },
  { dayOfWeek: 4, label: 'Чт', fullLabel: 'Четверг' },
  { dayOfWeek: 5, label: 'Пт', fullLabel: 'Пятница' },
  { dayOfWeek: 6, label: 'Сб', fullLabel: 'Суббота' },
  { dayOfWeek: 0, label: 'Вс', fullLabel: 'Воскресенье' },
]

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

interface EditScheduleButtonProps {
  groupId: number
  schedules: Array<{ id: number; dayOfWeek: number; time: string }>
}

export default function EditScheduleButton({ groupId, schedules }: EditScheduleButtonProps) {
  const { data: session } = useSessionQuery()
  const { data: hasPermission } = useOrganizationPermissionQuery({ group: ['update'] })
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)

  const sortedInitial = [...schedules]
    .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
    .map((s) => ({ dayOfWeek: s.dayOfWeek, time: s.time }))

  const form = useForm<UpdateScheduleSchemaType>({
    resolver: zodResolver(UpdateScheduleSchema),
    defaultValues: {
      schedule: sortedInitial,
    },
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'schedule',
  })

  const toggleDay = (dayOfWeek: number) => {
    const current = form.getValues('schedule') ?? []
    const exists = current.some((s) => s.dayOfWeek === dayOfWeek)

    let updated
    if (exists) {
      updated = current.filter((s) => s.dayOfWeek !== dayOfWeek)
    } else {
      updated = [...current, { dayOfWeek, time: '' }]
    }
    updated.sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
    replace(updated)
  }

  const handleSubmit = (data: UpdateScheduleSchemaType) => {
    if (!session?.organizationId) return
    startTransition(() => {
      const ok = updateGroupSchedule(groupId, session.organizationId!, data.schedule)
      toast.promise(ok, {
        loading: 'Сохранение расписания...',
        success: 'Расписание обновлено!',
        error: 'Ошибка при обновлении расписания.',
        finally: () => setDialogOpen(false),
      })
    })
  }

  if (!hasPermission?.success) return null

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <CalendarCog className="h-4 w-4" />
        Расписание
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать расписание</DialogTitle>
        </DialogHeader>
        <form id="edit-schedule-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4">
            <Field>
              <FieldLabel>Дни занятий</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {WEEKDAYS.map((day) => (
                  <Toggle
                    key={day.dayOfWeek}
                    pressed={fields.some((f) => f.dayOfWeek === day.dayOfWeek)}
                    onPressedChange={() => toggleDay(day.dayOfWeek)}
                    disabled={isPending}
                    size="sm"
                    variant="outline"
                  >
                    {day.label}
                  </Toggle>
                ))}
              </div>
              {form.formState.errors.schedule?.root && (
                <FieldError errors={[form.formState.errors.schedule.root]} />
              )}
              {fields.length > 0 && (
                <FieldDescription>Занятий в неделю: {fields.length}</FieldDescription>
              )}
            </Field>

            {fields.length > 0 && (
              <div className="space-y-3">
                <FieldLabel>Время для каждого дня</FieldLabel>
                {fields.map((field, index) => {
                  const dayInfo = WEEKDAYS.find((d) => d.dayOfWeek === field.dayOfWeek)
                  return (
                    <div key={field.id} className="flex items-center gap-3">
                      <span className="text-muted-foreground w-28 shrink-0 text-sm">
                        {dayInfo?.fullLabel}
                      </span>
                      <Controller
                        control={form.control}
                        name={`schedule.${index}.time`}
                        disabled={isPending}
                        render={({ field: timeField, fieldState }) => (
                          <div className="flex flex-col gap-1">
                            <Input
                              type="time"
                              className="w-32"
                              value={timeField.value || ''}
                              onChange={(e) => timeField.onChange(e.target.value)}
                              aria-invalid={fieldState.invalid}
                              disabled={isPending}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </div>
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)} size="sm">
            Отмена
          </Button>
          <Button form="edit-schedule-form" type="submit" disabled={isPending} size="sm">
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
