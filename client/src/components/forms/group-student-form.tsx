'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { IStudent } from '@/types/student'
import { FC } from 'react'
import { ApiResponse } from '@/types/response'
import { apiPost } from '@/actions/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const FormSchema = z.object({
  studentId: z.string({
    required_error: 'Please select a student.',
  }),
})

interface IComboboxProps {
  students: IStudent[]
  groupId: number
}

export const GroupStudentForm: FC<IComboboxProps> = ({ students, groupId }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const ok = new Promise<ApiResponse<IStudent>>((resolve, reject) => {
      apiPost<IStudent>(
        'groups/add-student',
        { groupId: groupId, studentId: data.studentId },
        `dashboard/groups/${groupId}`
      ).then((r) => {
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
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8 @container"
        onSubmit={form.handleSubmit(onSubmit)}
        id="group-student-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <div className="w-full">
                  <FormLabel>Ученик</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Выбрать ученика" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()} className="cursor-pointer">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
