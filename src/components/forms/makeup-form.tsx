'use client'

import { createAttendance, deleteAttendance } from '@/actions/attendance'
import { getLessons, LessonWithAttendanceAndGroup } from '@/actions/lessons'
import { createMakeUp } from '@/actions/makeup'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { MakeUpSchema, MakeUpSchemaType } from '@/schemas/makeup'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function MakeUpForm({
  studentId,
  missedAttendanceId,
  makeUpAttendanceId,
  onSubmit,
}: {
  studentId: number
  missedAttendanceId: number
  makeUpAttendanceId?: number
  onSubmit?: () => void
}) {
  const form = useForm<MakeUpSchemaType>({
    resolver: zodResolver(MakeUpSchema),
  })

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [lessons, setLessons] = useState<LessonWithAttendanceAndGroup[]>([])

  useEffect(() => {
    async function fetchLessons() {
      const today = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      )
      const l = await getLessons({
        where: { date: today },
        include: {
          attendance: { include: { student: true } },
          group: {
            include: {
              teachers: {
                include: {
                  teacher: {
                    omit: {
                      password: true,
                      passwordRequired: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      setLessons(l)
    }

    fetchLessons()
  }, [selectedDate])

  async function handleSubmit(values: MakeUpSchemaType) {
    try {
      toast.promise(
        (async () => {
          if (makeUpAttendanceId) await deleteAttendance({ where: { id: makeUpAttendanceId } })
          const attendance = await createAttendance({
            studentId,
            lessonId: values.makeUpLessonId,
            comment: '',
            status: 'UNSPECIFIED',
          })
          await createMakeUp({
            missedAttendanceId,
            makeUpAttendaceId: attendance.id,
          })
        })(),
        {
          loading: 'Сохраняем...',
          success: 'Отработка успешно создана',
          error: (e) => e.message,
          finally: onSubmit,
        }
      )
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Form {...form}>
      <form
        className="@container space-y-8"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="makeup-form"
      >
        <FormField
          control={form.control}
          name="makeUpLessonId"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Урок для отработки</FormLabel>
              <div className="space-y-2">
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      size={'sm'}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      onSelect={setSelectedDate}
                      locale={ru}
                      selected={selectedDate}
                      required
                    />
                  </PopoverContent>
                </Popover>

                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(+value)}
                  >
                    <SelectTrigger className="w-full" size={'sm'}>
                      <SelectValue placeholder="Выберите урок" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.length > 0 ? (
                        lessons.map((lesson) => (
                          <SelectItem key={lesson.id} value={lesson.id.toString()}>
                            {lesson.group.name} -{' '}
                            {lesson.group.teachers
                              .map(
                                (teacher) =>
                                  `${teacher.teacher.firstName} ${teacher.teacher.lastName ?? ''}`
                              )
                              .join(', ')}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-muted-foreground p-2 text-sm">
                          Нет доступных уроков
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
