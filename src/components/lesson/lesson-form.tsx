import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod/v4'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'
import { ru } from 'date-fns/locale'
import { ChevronDownIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Input } from '../ui/input'
import { ApiResponse } from '@/types/response'
import { ILesson } from '@/types/lesson'
import { api } from '@/lib/api/api-client'
import { toast } from 'sonner'

const LessonFormSchema = z.object({
  date: z.date(),
  time: z.string(),
  groupId: z.number(),
})

export default function LessonForm({ lesson, groupId }: { lesson?: ILesson; groupId: number }) {
  const form = useForm<z.infer<typeof LessonFormSchema>>({
    resolver: zodResolver(LessonFormSchema),
    defaultValues: {
      date: lesson ? new Date(lesson.date) : new Date(),
      time: lesson ? lesson.time : '00:00',
      groupId: lesson ? lesson.groupId : groupId,
    },
  })
  const onSubmit = (values: z.infer<typeof LessonFormSchema>) => {
    const body = { date: format(values.date, 'yyyy-MM-dd'), time: values.time, groupId: groupId }
    const ok = new Promise<ApiResponse<ILesson>>((resolve, reject) => {
      let res
      if (lesson) {
        res = api.update<ILesson>(`lessons/${lesson.id}`, body, `dashboard/groups/${groupId}`)
      } else {
        res = api.post<ILesson>('lessons', body, `dashboard/groups/${groupId}`)
      }
      res.then((r) => {
        if (r.success) {
          resolve(r)
        } else {
          reject(r)
        }
      })
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="date-picker" className="px-1">
                Дата
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="justify-between font-normal"
                  >
                    {field.value ? format(field.value, 'yyyy-MM-dd') : <span>Выберите дату</span>}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    fixedWeeks
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
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="time-picker" className="px-1">
                Время
              </FormLabel>
              <FormControl>
                <Input
                  type="time"
                  id="time-picker"
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-end">
          <Button type="submit" className="cursor-pointer">
            Подтвердить
          </Button>
        </div>
      </form>
    </Form>
  )
}
