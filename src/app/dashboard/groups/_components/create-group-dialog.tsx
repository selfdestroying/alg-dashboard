'use client'

import { Controller, useForm } from 'react-hook-form'

import { createGroup } from '@/actions/groups'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { getFullName } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
import { CreateGroupSchema, CreateGroupSchemaType } from '@/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, Loader, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const timeSlots = [
  { label: '09:00', value: '09:00' },
  { label: '09:30', value: '09:30' },
  { label: '10:00', value: '10:00' },
  { label: '10:30', value: '10:30' },
  { label: '11:00', value: '11:00' },
  { label: '11:30', value: '11:30' },
  { label: '12:00', value: '12:00' },
  { label: '12:30', value: '12:30' },
  { label: '13:00', value: '13:00' },
  { label: '13:30', value: '13:30' },
  { label: '14:00', value: '14:00' },
  { label: '14:30', value: '14:30' },
  { label: '15:00', value: '15:00' },
  { label: '15:30', value: '15:30' },
  { label: '16:00', value: '16:00' },
  { label: '16:30', value: '16:30' },
  { label: '17:00', value: '17:00' },
  { label: '17:30', value: '17:30' },
  { label: '18:00', value: '18:00' },
  { label: '18:30', value: '18:30' },
  { label: '19:00', value: '19:00' },
  { label: '19:30', value: '19:30' },
  { label: '20:00', value: '20:00' },
]

export default function CreateGroupDialog() {
  const { courses, users, locations } = useData()
  const isMobile = useIsMobile()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<CreateGroupSchemaType>({
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
      name: '',
      backOfficeUrl: undefined,
      time: undefined,
      type: undefined,
      dateRange: undefined,
      course: undefined,
      location: undefined,
      teacher: undefined,
      lessonCount: undefined,
    },
  })

  const onSubmit = (values: CreateGroupSchemaType) => {
    startTransition(() => {
      console.log(values)
      const { course, location, teacher, dateRange, ...payload } = values
      const ok = createGroup({
        data: {
          ...payload,
          courseId: course.value,
          locationId: location.value,
          teachers: { create: [{ teacherId: teacher.value }] },
          startDate: dateRange.from,
          endDate: dateRange.to,
          dayOfWeek: dateRange.from.getDay(),
        },
      })
      toast.promise(ok, {
        loading: 'Создание группы...',
        success: 'Группа успешно создана!',
        error: 'Не удалось создать группу. Попробуйте еще раз.',
        finally: () => {
          setDialogOpen(false)
          form.reset()
        },
      })
    })
  }

  const mappedCourses = courses.map((course) => ({
    value: course.id,
    label: course.name,
  }))
  const mappedLocations = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }))
  const mappedTeachers = users.map((user) => ({
    value: user.id,
    label: getFullName(user.firstName, user.lastName),
  }))

  return (
    <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
      <SheetTrigger render={<Button size={'icon'} />}>
        <Plus />
      </SheetTrigger>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="data-[side=bottom]:max-h-[70vh]"
      >
        <SheetHeader>
          <SheetTitle>Создать группу</SheetTitle>
          <SheetDescription>Заполните форму ниже, чтобы создать новую группу.</SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="create-group-form"
          className="no-scrollbar overflow-auto px-6 py-2"
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="course"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="courseId-field">Курс</FieldLabel>
                  <Select
                    items={mappedCourses}
                    {...field}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    isItemEqualToValue={(itemValue, value) => itemValue.value === value.value}
                  >
                    <SelectTrigger id="courseId-field" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Выберите курс" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mappedCourses.map((course) => (
                          <SelectItem key={course.value} value={course}>
                            {course.label}
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
              name="location"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="locationId-field">Локация</FieldLabel>
                  <Select
                    items={mappedLocations}
                    {...field}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    isItemEqualToValue={(itemValue, value) => itemValue.value === value.value}
                  >
                    <SelectTrigger id="locationId-field" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Выберите локацию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mappedLocations.map((location) => (
                          <SelectItem key={location.value} value={location}>
                            {location.label}
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
              name="teacher"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="teacherId-field">Преподаватель</FieldLabel>
                  <Select
                    items={mappedCourses}
                    {...field}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    isItemEqualToValue={(itemValue, value) => itemValue.value === value.value}
                  >
                    <SelectTrigger id="teacherId-field" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Выберите преподавателя" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mappedTeachers.map((teacher) => (
                          <SelectItem key={teacher.value} value={teacher}>
                            {teacher.label}
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
              name="type"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="type-field">Тип</FieldLabel>
                  <Select
                    {...field}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    itemToStringLabel={(itemValue) => (itemValue === 'GROUP' ? 'Группа' : 'Индив.')}
                  >
                    <SelectTrigger id="type-field" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="GROUP">Группа</SelectItem>
                        <SelectItem value="INDIVIDUAL">Индив.</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="time"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="time-field">Время</FieldLabel>
                  <Select
                    {...field}
                    items={timeSlots}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="time-field" aria-invalid={fieldState.invalid}>
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
              control={form.control}
              name="dateRange"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="dateRange-field">Период</FieldLabel>
                  <Popover modal>
                    <PopoverTrigger
                      render={<Button variant="outline" />}
                      aria-invalid={fieldState.invalid}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? `${format(field.value.from, 'dd.MM.yyyy')} - ${format(field.value.to, 'dd.MM.yyyy')}`
                        : 'Выбрать период'}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        id="dateRange-field"
                        mode="range"
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="lessonCount"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="lessonCount-field">Количество занятий</FieldLabel>
                  <Input
                    id="lessonCount-field"
                    {...field}
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="backOfficeUrl"
              disabled={isPending}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="backOfficeUrl-field">Ссылка на BackOffice</FieldLabel>
                  <Input
                    id="backOfficeUrl-field"
                    {...field}
                    value={field.value ?? ''}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Отмена</SheetClose>
          <Button type="submit" form="create-group-form" disabled={isPending}>
            {isPending && <Loader className="animate-spin" />}
            Создать
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
