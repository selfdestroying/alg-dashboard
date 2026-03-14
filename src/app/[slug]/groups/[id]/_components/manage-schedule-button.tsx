'use client'

import {
  updateScheduleAndRegenerateLessons,
  type ScheduleAndLessonsResult,
} from '@/src/actions/groups'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { Calendar, CalendarDayButton } from '@/src/components/ui/calendar'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { Separator } from '@/src/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/src/components/ui/sheet'
import { Toggle } from '@/src/components/ui/toggle'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { DaysOfWeek } from '@/src/lib/utils'
import {
  UpdateScheduleAndLessonsSchema,
  UpdateScheduleAndLessonsSchemaType,
} from '@/src/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarCog, CalendarIcon, Info, TriangleAlert } from 'lucide-react'
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

interface ManageScheduleButtonProps {
  groupId: number
  schedules: Array<{ id: number; dayOfWeek: number; time: string }>
}

function formatResult(result: ScheduleAndLessonsResult): string {
  const parts: string[] = []
  if (result.deletedLessonsCount > 0) {
    parts.push(`удалено ${result.deletedLessonsCount}`)
  }
  parts.push(`создано ${result.createdLessonsCount} уроков`)
  if (result.assignedTeachersCount > 0) {
    parts.push(`${result.assignedTeachersCount} преп.`)
  }
  if (result.assignedStudentsCount > 0) {
    parts.push(`${result.assignedStudentsCount} уч.`)
  }
  if (result.firstLessonDate && result.lastLessonDate) {
    const from = format(result.firstLessonDate, 'dd.MM.yyyy', { locale: ru })
    const to = format(result.lastLessonDate, 'dd.MM.yyyy', { locale: ru })
    parts.push(`период: ${from} — ${to}`)
  }
  return parts.join(', ')
}

export default function ManageScheduleButton({ groupId, schedules }: ManageScheduleButtonProps) {
  const { data: session } = useSessionQuery()
  const { data: hasPermission } = useOrganizationPermissionQuery({
    group: ['update'],
    lesson: ['create'],
  })
  const [isPending, startTransition] = useTransition()
  const [sheetOpen, setSheetOpen] = useState(false)

  const sortedInitial = [...schedules]
    .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
    .map((s) => ({ dayOfWeek: s.dayOfWeek, time: s.time }))

  const form = useForm<UpdateScheduleAndLessonsSchemaType>({
    resolver: zodResolver(UpdateScheduleAndLessonsSchema),
    defaultValues: {
      schedule: sortedInitial,
      startDate: undefined,
      lessonCount: undefined,
    },
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'schedule',
  })

  const watchedStartDate = form.watch('startDate')
  const watchedLessonCount = form.watch('lessonCount')

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

  const handleSubmit = (data: UpdateScheduleAndLessonsSchemaType) => {
    if (!session?.organizationId) return
    startTransition(async () => {
      try {
        const result = await updateScheduleAndRegenerateLessons(
          groupId,
          session.organizationId!,
          data.schedule,
          data.startDate,
          data.lessonCount,
        )
        toast.success('Расписание обновлено и уроки перегенерированы', {
          description: formatResult(result),
          duration: 6000,
        })
        setSheetOpen(false)
      } catch {
        toast.error('Ошибка при обновлении расписания и перегенерации уроков')
      }
    })
  }

  // Estimate lesson generation period
  const schedulePreview = (() => {
    if (!watchedLessonCount || watchedLessonCount <= 0 || fields.length === 0) return null
    const weeksNeeded = Math.ceil(watchedLessonCount / fields.length)
    const totalDays = weeksNeeded * 7
    return { weeksNeeded, totalDays }
  })()

  if (!hasPermission?.success) return null

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger render={<Button variant="outline" />}>
        <CalendarCog className="h-4 w-4" />
        Расписание и уроки
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Управление расписанием</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto px-4">
          <form id="manage-schedule-form" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-5">
              {/* ── Section 1: Schedule ── */}
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Расписание занятий
                </p>
                <Field>
                  <FieldLabel>Дни занятий</FieldLabel>
                  <div className="flex flex-wrap gap-1">
                    {WEEKDAYS.map((day) => (
                      <Toggle
                        key={day.dayOfWeek}
                        pressed={fields.some((f) => f.dayOfWeek === day.dayOfWeek)}
                        onPressedChange={() => toggleDay(day.dayOfWeek)}
                        disabled={isPending}
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

              <Separator />

              {/* ── Section 2: Lesson generation ── */}
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Генерация уроков
                </p>
                <FieldGroup className="gap-4">
                  <Controller
                    control={form.control}
                    name="startDate"
                    disabled={isPending}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldContent>
                          <FieldLabel htmlFor="manage-startDate">Начиная с даты</FieldLabel>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </FieldContent>
                        <Popover modal>
                          <PopoverTrigger
                            render={<Button variant="outline" />}
                            aria-invalid={fieldState.invalid}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, 'dd.MM.yyyy (EEEE)', { locale: ru })
                              : 'Выберите дату'}
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              id="manage-startDate"
                              mode="single"
                              disabled={{ before: new Date() }}
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ru}
                              components={{
                                DayButton: (props) => (
                                  <CalendarDayButton
                                    {...props}
                                    data-day={props.day.date.toLocaleDateString('ru-RU')}
                                  />
                                ),
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        {watchedStartDate && (
                          <FieldDescription>
                            День недели: {DaysOfWeek.full[watchedStartDate.getDay()]}
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="lessonCount"
                    disabled={isPending}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldContent>
                          <FieldLabel htmlFor="manage-lessonCount">Количество занятий</FieldLabel>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </FieldContent>
                        <Input
                          id="manage-lessonCount"
                          type="number"
                          min={1}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>

              {/* ── Preview ── */}
              {schedulePreview && watchedStartDate && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-muted-foreground text-xs">
                    <span className="font-medium">Предварительный расчёт:</span>{' '}
                    {watchedLessonCount} уроков за ~{schedulePreview.weeksNeeded} нед. (
                    {fields
                      .map((f) => WEEKDAYS.find((d) => d.dayOfWeek === f.dayOfWeek)?.label)
                      .join(', ')}
                    )
                  </AlertDescription>
                </Alert>
              )}

              {/* ── Warning ── */}
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>
                  Расписание будет обновлено, а все уроки начиная с выбранной даты — удалены и
                  созданы заново. Данные посещаемости удалённых уроков будут потеряны.
                </AlertDescription>
              </Alert>
            </div>
          </form>
        </div>
        <SheetFooter>
          <Button variant="secondary" onClick={() => setSheetOpen(false)}>
            Отмена
          </Button>
          <Button
            form="manage-schedule-form"
            type="submit"
            disabled={isPending}
            variant="destructive"
          >
            {isPending ? 'Сохранение...' : 'Сохранить и перегенерировать'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
