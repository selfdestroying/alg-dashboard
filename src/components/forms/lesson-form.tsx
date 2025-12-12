'use client'
import { createLesson } from '@/actions/lessons'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LessonSchema, LessonSchemaType } from '@/schemas/lesson'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
export default function LessonForm({
  groupId,
  onSubmit,
}: {
  groupId: number
  onSubmit?: () => void
}) {
  const form = useForm<LessonSchemaType>({
    resolver: zodResolver(LessonSchema),
  })

  function handleSubmit(values: LessonSchemaType) {
    const ok = createLesson({ date: values.date, time: values.time, groupId })
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Урок успешно создан',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="@container space-y-8"
        id="lesson-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <p className="data-[error=true]:text-destructive flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Дата
                </p>

                <Popover modal>
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
            name="time"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Время</FormLabel>

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
        </div>
      </form>
    </Form>
  )
}
