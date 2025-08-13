'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'

import { createAttendance } from '@/actions/attendance'
import { LessonWithAttendanceAndGroup } from '@/actions/lessons'
import { createMakeUp } from '@/actions/makeup'
import { MakeUpSchema, MakeUpSchemaType } from '@/schemas/makeup'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function MakeUpForm({
  upcomingLessons,
  studentId,
  missedAttendanceId,
  onSubmit,
}: {
  upcomingLessons: LessonWithAttendanceAndGroup[]
  studentId: number
  missedAttendanceId: number
  onSubmit?: () => void
}) {
  const form = useForm<MakeUpSchemaType>({
    resolver: zodResolver(MakeUpSchema),
  })

  function handleSubmit(values: MakeUpSchemaType) {
    const ok = createAttendance({
      studentId,
      lessonId: values.makeUpLessonId,
      comment: '',
      status: 'UNSPECIFIED',
    }).then((res) => createMakeUp({ missedAttendanceId, makeUpAttendaceId: res.id }))
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Ученик успешно создан',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <Form {...form}>
      <form
        className="@container space-y-8"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="makeup-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="makeUpLessonId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Урок для отработки</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select key="select-0" onValueChange={(value) => field.onChange(+value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {upcomingLessons.map((lesson) => (
                          <SelectItem key={lesson.id} value={lesson.id.toString()}>
                            {lesson.date.toLocaleDateString('ru-RU')}- {lesson.group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
