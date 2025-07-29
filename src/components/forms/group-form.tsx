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
import { GroupSchema, GroupSchemaType } from '@/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { GroupType } from '@prisma/client'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Checkbox } from '../ui/checkbox'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'

const timeSlots = [
  { time: '09:00', available: false },
  { time: '09:30', available: false },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: true },
  { time: '12:00', available: false },
  { time: '12:30', available: true },
  { time: '13:00', available: true },
  { time: '13:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: false },
  { time: '15:00', available: false },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: true },
  { time: '17:00', available: true },
  { time: '17:30', available: true },
]

export default function GroupForm() {
  const [endDateCheck, setEndDateCheck] = useState<boolean>(false)
  const { courses, users } = useData()

  const form = useForm<GroupSchemaType>({
    resolver: zodResolver(GroupSchema),
  })

  function onSubmit(values: GroupSchemaType) {
    const ok = createGroup(values)
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Группа успешно создана',
      error: (e) => e.message,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="@container space-y-8" id="group-form">
        <div className="grid grid-cols-12 gap-4">
          {/* Required */}
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">
                  Курс<span className="text-destructive">*</span>
                </FormLabel>
                <Select key="select-0" onValueChange={(value) => field.onChange(+value)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
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
            name="teacherId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">
                  Учитель<span className="text-destructive">*</span>
                </FormLabel>

                <Select key="select-1" onValueChange={(value) => field.onChange(+value)}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
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
          <div className="col-span-12 col-start-auto flex flex-row items-start gap-2 space-y-0 self-end">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <p className="data-[error=true]:text-destructive flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                    Дата начала<span className="text-destructive">*</span>
                  </p>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd.MM.yyyy') : 'Выбрать дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" onSelect={field.onChange} />
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
                  <p className="data-[error=true]:text-destructive flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                    <Checkbox
                      defaultChecked={endDateCheck}
                      onCheckedChange={(checked) => setEndDateCheck(checked.valueOf() as boolean)}
                    />
                    Дата конца
                  </p>

                  <Popover>
                    <PopoverTrigger asChild disabled={!endDateCheck}>
                      <Button
                        variant={'outline'}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd.MM.yyyy') : 'Выбрать дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = form.getValues('startDate')
                          return startDate != undefined && date < startDate
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Optional */}
          <Accordion
            type="single"
            collapsible
            className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end"
          >
            <AccordionItem
              value="optional"
              className="col-span-12 col-start-auto w-full gap-2 space-y-2 self-end"
            >
              <AccordionTrigger className="w-full py-0">Дополнительные параметры</AccordionTrigger>
              <AccordionContent className="w-full space-y-4">
                {/* Dates */}

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                      <FormLabel className="flex shrink-0">Время занятия</FormLabel>

                      <Select {...field} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((timeSlot) => (
                            <SelectItem key={timeSlot.time} value={timeSlot.time}>
                              {timeSlot.time}
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
                    <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                      <p className="data-[error=true]:text-destructive flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                        Тип группы
                      </p>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange}>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value={GroupType.GROUP} />
                            </FormControl>
                            <FormLabel className="font-normal">Группа</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value={GroupType.INDIVIDUAL} />
                            </FormControl>
                            <FormLabel className="font-normal">Индивидуальные занятия</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value={GroupType.INTENSIVE} />
                            </FormControl>
                            <FormLabel className="font-normal">Интенсив</FormLabel>
                          </FormItem>
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
                    <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                      <FormLabel className="flex shrink-0">Количество занятий</FormLabel>

                      <FormControl>
                        <Input
                          name={field.name}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backOfficeUrl"
                  render={({ field }) => (
                    <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                      <FormLabel className="flex shrink-0">Ссылка на backoffice</FormLabel>

                      <FormControl>
                        <Input
                          key="url-input-0"
                          placeholder=""
                          type="url"
                          className=" "
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </form>
    </Form>
  )
}
