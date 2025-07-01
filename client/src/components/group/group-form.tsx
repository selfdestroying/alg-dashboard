'use client'

import type React from 'react'

import { Input } from '@/components/ui/input'

import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FC } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { IGroup } from '@/types/group'
import { ApiResponse } from '@/types/response'
import { api } from '@/lib/api/api-client'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '../ui/calendar'
import { useData } from '../data-provider'
import { ru } from 'date-fns/locale'

const GroupFormSchema = z.object({
  name: z.string(),
  course: z.string(),
  teacher: z.string(),
  date: z.date(),
  time: z.string(),
  backofficeUrl: z.url({ protocol: /^https$/, hostname: /^backoffice.algoritmika\.org$/ }),
})

interface IDefaultValues {
  name: string
  time: string
  date: Date
  backofficeUrl: string
}

interface IGroupFormProps {
  group?: IGroup
  defaultValues: IDefaultValues
}

export const GroupForm: FC<IGroupFormProps> = ({ group, defaultValues }) => {
  const { courses, teachers } = useData()
  const form = useForm<z.infer<typeof GroupFormSchema>>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: group
      ? {
          name: group.name,
          course: courses.find((i) => i.name == group.course)?.id.toString(),
          teacher: teachers.find((t) => t.id == group.teacher.id)?.id.toString(),
          time: group.lessonTime,
          date: new Date(group.startDate),
          backofficeUrl: group.backOfficeUrl,
        }
      : defaultValues,
  })
  const onValid = (values: z.infer<typeof GroupFormSchema>) => {
    const body = {
      name: values.name,
      courseId: +values.course,
      teacherId: +values.teacher,
      startDate: format(values.date, 'yyyy-MM-dd'),
      lessonTime: values.time,
      backofficeUrl: values.backofficeUrl,
    }
    const ok = new Promise<ApiResponse<IGroup>>((resolve, reject) => {
      let res
      if (group) {
        res = api.update<IGroup>(`groups/${group.id}`, body, 'dashboard/groups')
      } else {
        res = api.post<IGroup>('groups', body, 'dashboard/groups')
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
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Курс</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Выбрать курс" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()} className="cursor-pointer">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teacher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Учитель</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Выбрать учителя" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()} className="cursor-pointer">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="backofficeUrl"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>BackOffice Url</FormLabel>
              <FormControl>
                <Input {...field} />
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
