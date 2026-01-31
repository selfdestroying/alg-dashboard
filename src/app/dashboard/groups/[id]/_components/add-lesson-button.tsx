'use client'
import { createLesson } from '@/actions/lessons'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
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
import { zodResolver } from '@hookform/resolvers/zod'
import { Prisma } from '@prisma/client'
import { ru } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { timeSlots } from '../../_components/create-group-dialog'

interface AddLessonButtonProps {
  group: Prisma.GroupGetPayload<{ include: { students: true } }>
}

const AddLessonSchema = z.object({
  date: z.date('Выберите дату урока'),
  time: z.string('Введите время урока'),
  isAddStudents: z.boolean(),
})

type AddLessonSchemaType = z.infer<typeof AddLessonSchema>

export default function AddLessonButton({ group }: AddLessonButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm({
    resolver: zodResolver(AddLessonSchema),
    defaultValues: {
      date: undefined,
      time: undefined,
      isAddStudents: true,
    },
  })

  const handleSubmit = (values: AddLessonSchemaType) => {
    startTransition(() => {
      const { isAddStudents, ...payload } = values
      const attendances = group.students.map((student) => ({
        studentId: student.studentId,
        status: 'UNSPECIFIED' as const,
        comment: '',
      }))
      const ok = createLesson({
        data: {
          ...payload,
          groupId: group.id,
          attendance: isAddStudents
            ? {
                createMany: {
                  data: attendances,
                },
              }
            : undefined,
        },
      })
      toast.promise(ok, {
        loading: 'Добавление занятия...',
        success: 'Занятие успешно добавлено!',
        error: 'Ошибка при добавлении занятия.',
        finally: () => {
          setDialogOpen(false)
          form.reset()
        },
      })
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <Button size={'icon'}>
            <Plus />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить занятие</DialogTitle>
          <DialogDescription>Введите дату и время для нового занятия</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} id="add-lesson-form">
          <FieldGroup>
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="lesson-date-field">Дата урока</FieldLabel>
                  <Calendar
                    id="lesson-date-field"
                    mode="single"
                    selected={field.value || null}
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="time"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="lesson-time-field">Время урока</FieldLabel>
                  <Select
                    {...field}
                    items={timeSlots}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="lesson-time-field" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
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
              name="isAddStudents"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <Field orientation="horizontal">
                    <FieldLabel
                      htmlFor="toggle-apply-to-lessons"
                      className="hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-2 has-aria-checked:border-violet-600 has-aria-checked:bg-violet-50 dark:has-aria-checked:border-violet-900 dark:has-aria-checked:bg-violet-950"
                    >
                      <Checkbox
                        id="toggle-apply-to-lessons"
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white dark:data-[state=checked]:border-violet-700 dark:data-[state=checked]:bg-violet-700"
                      />
                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">
                          Добавить всех студентов из группы
                        </p>
                      </div>
                    </FieldLabel>
                  </Field>
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant={'outline'}>Отмена</Button>} />
          <Button type="submit" form="add-lesson-form" disabled={isPending}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
