'use client'
import { createGroup } from '@/actions/groups'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/providers/data-provider'
import { CreateGroupSchema, CreateGroupSchemaType } from '@/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { GroupType } from '@prisma/client'
import { differenceInWeeks, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'

export const timeSlots = [
  { time: '09:00' },
  { time: '09:30' },
  { time: '10:00' },
  { time: '10:30' },
  { time: '11:00' },
  { time: '11:30' },
  { time: '12:00' },
  { time: '12:30' },
  { time: '13:00' },
  { time: '13:30' },
  { time: '14:00' },
  { time: '14:30' },
  { time: '15:00' },
  { time: '15:30' },
  { time: '16:00' },
  { time: '16:30' },
  { time: '17:00' },
  { time: '17:30' },
  { time: '18:00' },
  { time: '18:30' },
  { time: '19:00' },
  { time: '19:30' },
  { time: '20:00' },
]

export default function GroupForm({ onSubmit }: { onSubmit?: () => void }) {
  const id = useId()

  const [hasEndDate, setHasEndDate] = useState(false)
  const { courses, users, locations } = useData()

  const form = useForm<CreateGroupSchemaType>({
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
      backOfficeUrl: '',
      type: 'GROUP',
    },
  })

  function handleSubmit(values: CreateGroupSchemaType) {
    const { teacherId, ...data } = values
    const promise = createGroup({ data: { ...data, name: '' } }, teacherId)
    toast.promise(promise, {
      loading: 'Создание группы...',
      success: 'Группа успешно создана',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8" id="group-form">
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>
                  Курс <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={(v) => field.onChange(+v)} value={field.value?.toString()}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите курс" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>
                  Локация <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={(v) => field.onChange(+v)} value={field.value?.toString()}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите локацию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>
                  Учитель <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={(v) => field.onChange(+v)} value={field.value?.toString()}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите учителя" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-12 flex gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Дата начала <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd.MM.yyyy') : 'Выбрать дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="flex items-center gap-2">
                    <Checkbox
                      checked={hasEndDate}
                      onCheckedChange={(checked) => {
                        setHasEndDate(Boolean(checked))
                        if (!checked) {
                          form.setValue('lessonCount', undefined)
                        }
                      }}
                    />
                    Дата конца
                  </FormLabel>
                  <Popover modal>
                    <PopoverTrigger asChild disabled={!hasEndDate}>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd.MM.yyyy') : 'Выбрать дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        locale={ru}
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          const start = form.getValues('startDate')
                          if (start && date) {
                            const weeks = differenceInWeeks(date, start) + 1
                            form.setValue('lessonCount', weeks)
                          }
                        }}
                        disabled={(date) => {
                          const start = form.getValues('startDate')
                          return start && date < start
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>Время занятия</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.time} value={slot.time}>
                        {slot.time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>Тип группы</FormLabel>
                <FormControl>
                  <RadioGroup
                    className="grid grid-cols-1 md:grid-cols-3"
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <div
                      key={`${id}-${GroupType.GROUP}`}
                      className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          id={`${id}-${GroupType.GROUP}`}
                          value={GroupType.GROUP}
                          className="after:absolute after:inset-0"
                        />
                        <Label htmlFor={`${id}-${GroupType.GROUP}`}>Группа</Label>
                      </div>
                    </div>
                    <div
                      key={`${id}-${GroupType.INDIVIDUAL}`}
                      className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          id={`${id}-${GroupType.INDIVIDUAL}`}
                          value={GroupType.INDIVIDUAL}
                          className="after:absolute after:inset-0"
                        />
                        <Label htmlFor={`${id}-${GroupType.INDIVIDUAL}`}>Индив</Label>
                      </div>
                    </div>
                    <div
                      key={`${id}-${GroupType.INTENSIVE}`}
                      className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          id={`${id}-${GroupType.INTENSIVE}`}
                          value={GroupType.INTENSIVE}
                          className="after:absolute after:inset-0"
                        />
                        <Label htmlFor={`${id}-${GroupType.INTENSIVE}`}>Интенсив</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lessonCount"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>Количество занятий</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Backoffice URL */}
          <FormField
            control={form.control}
            name="backOfficeUrl"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>Ссылка на backoffice</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
