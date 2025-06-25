'use client'

import { ILesson } from '@/types/lesson'
import { Checkbox } from '../ui/checkbox'
import { Button } from '../ui/button'
import z from 'zod/v4'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/response'
import { IAttendance } from '@/types/attendance'
import { api } from '@/lib/api/api-client'
import { useState } from 'react'

const FormSchema = z.object({
  items: z.array(z.string()),
})

export default function AttendanceForm({ lesson }: { lesson: ILesson }) {
  const [changed, setChanged] = useState<boolean>(true)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: lesson.attendances.filter((a) => a.wasPresent).map((a) => a.student),
    },
  })
  function onSubmit(data: z.infer<typeof FormSchema>) {
    const newAttendances = lesson.attendances.map((a) => {
      a.wasPresent = data.items.includes(a.student)
      return a
    })

    const ok = new Promise<ApiResponse<IAttendance>>((resolve, reject) => {
      const res = api.update<IAttendance>(
        `lessons/${lesson.id}/attendance`,
        newAttendances,
        'dashboard/groups'
      )

      res.then((r) => {
        if (r.success) {
          resolve(r)
        } else {
          reject(r)
        }
      })
    })
    toast.promise(ok, {
      loading: 'Loding...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
    setChanged(true)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lesson.attendances.map((item) => (
            <FormField
              key={item.student}
              control={form.control}
              name="items"
              render={({ field }) => {
                return (
                  <FormItem key={item.student} className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        className="cursor-pointer"
                        checked={field.value?.includes(item.student)}
                        onCheckedChange={(checked) => {
                          setChanged(false)
                          return checked
                            ? field.onChange([...field.value, item.student])
                            : field.onChange(field.value?.filter((value) => value !== item.student))
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">{item.student}</FormLabel>
                  </FormItem>
                )
              }}
            />
          ))}
          <FormMessage />
        </div>
        <Button disabled={changed} type="submit" className="cursor-pointer">
          Submit
        </Button>
      </form>
    </Form>
  )
}
