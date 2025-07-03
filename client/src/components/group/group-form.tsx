'use client'

import React, { FC } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { useData } from '../data-provider'
import { GroupType, IGroup } from '@/types/group'
import { api } from '@/lib/api/api-client'

const GroupFormSchema = z.object({
  name: z.string().nonempty({ error: 'Название не может быть пустым' }),
  course: z.string(),
  teacher: z.string(),
  date: z.date(),
  time: z.string(),
  backofficeUrl: z.url({ protocol: /^https$/, hostname: /^backoffice.algoritmika\.org$/ }),
  type: z.number(),
  lessonsAmount: z.number().nonnegative().min(1),
})

interface IDefaultValues {
  name: string
  time: string
  date: Date
  backofficeUrl: string
  type: GroupType
  lessonsAmount: number
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
          lessonsAmount: group.lessonsAmount,
          type: group.type,
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
      type: values.type,
      lessonsAmount: values.lessonsAmount,
    }

    const ok = group
      ? api.update<IGroup>(`groups/${group.id}`, body, 'dashboard/groups')
      : api.post<IGroup>('groups', body, 'dashboard/groups')

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValid)}
        className="flex flex-col gap-2 overflow-auto h-fit max-h-screen space-y-2 pb-10"
      >
        <Tabs defaultValue="main" className="w-full">
          <TabsList>
            <TabsTrigger value="main" className="cursor-pointer">
              Основное
            </TabsTrigger>
            <TabsTrigger value="schedule" className="cursor-pointer">
              Расписание
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!group && (
              <FormField
                control={form.control}
                name="lessonsAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество занятий</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <p className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive">
                    Тип группы
                  </p>
                  <FormControl>
                    <RadioGroup
                      defaultValue={field.value.toString()}
                      onValueChange={(e) => field.onChange(+e)}
                    >
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="0" />
                        </FormControl>
                        <FormLabel className="font-normal">Группа</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="1" />
                        </FormControl>
                        <FormLabel className="font-normal">Индивидуальные занятия</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="2" />
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
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Курс</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать курс" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать учителя" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-between">
                        {field.value ? format(field.value, 'dd.MM.yyyy') : 'Выбрать дату'}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
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
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Время</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backofficeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backoffice URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Кнопка подтверждения внизу */}
        <Button type="submit" className="w-full cursor-pointer">
          Подтвердить
        </Button>
      </form>
    </Form>
  )
}
