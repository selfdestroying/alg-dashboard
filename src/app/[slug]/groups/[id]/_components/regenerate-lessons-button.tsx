'use client'

import { regenerateLessons } from '@/src/actions/groups'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { Calendar, CalendarDayButton } from '@/src/components/ui/calendar'
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
} from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { DaysOfWeek } from '@/src/lib/utils'
import { RegenerateLessonsSchema, RegenerateLessonsSchemaType } from '@/src/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, RefreshCw, TriangleAlert } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface RegenerateLessonsButtonProps {
  groupId: number
}

export default function RegenerateLessonsButton({ groupId }: RegenerateLessonsButtonProps) {
  const { data: session } = useSessionQuery()
  const { data: hasPermission } = useOrganizationPermissionQuery({ lesson: ['create'] })
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<RegenerateLessonsSchemaType>({
    resolver: zodResolver(RegenerateLessonsSchema),
    defaultValues: {
      startDate: undefined,
      lessonCount: undefined,
    },
  })

  const watchedStartDate = form.watch('startDate')

  const handleSubmit = (data: RegenerateLessonsSchemaType) => {
    if (!session?.organizationId) return
    startTransition(() => {
      const ok = regenerateLessons(
        groupId,
        session.organizationId!,
        data.startDate,
        data.lessonCount,
      )
      toast.promise(ok, {
        loading: 'Перегенерация уроков...',
        success: 'Уроки успешно перегенерированы!',
        error: 'Ошибка при перегенерации уроков.',
        finally: () => setDialogOpen(false),
      })
    })
  }

  if (!hasPermission?.success) return null

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <RefreshCw className="h-4 w-4" />
        Перегенерировать
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Перегенерировать уроки</DialogTitle>
        </DialogHeader>

        <form id="regenerate-lessons-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="startDate"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="regenerate-startDate">Начиная с даты</FieldLabel>
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
                        id="regenerate-startDate"
                        mode="single"
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
                    <FieldLabel htmlFor="regenerate-lessonCount">Количество занятий</FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                  <Input
                    id="regenerate-lessonCount"
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
        </form>
        <Alert variant={'destructive'}>
          <TriangleAlert />
          <AlertDescription>
            Все уроки начиная с выбранной даты будут удалены и созданы заново на основе текущего
            расписания группы. Данные посещаемости удалённых уроков будут потеряны.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            form="regenerate-lessons-form"
            type="submit"
            disabled={isPending}
            variant="destructive"
          >
            Перегенерировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
