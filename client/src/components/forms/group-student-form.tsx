'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { FC } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Student } from '@prisma/client'
import { addToGroup } from '@/actions/groups'
import { StudentGroupSchema, StudentGroupSchemaType } from '@/schemas/group'

interface IComboboxProps {
  students: Student[]
  groupId: number
}

export const GroupStudentForm: FC<IComboboxProps> = ({ students, groupId }) => {
  const form = useForm<StudentGroupSchemaType>({
    resolver: zodResolver(StudentGroupSchema),
  })

  function onSubmit(data: StudentGroupSchemaType) {
    const ok = addToGroup({ studentId: data.studentId, groupId })
    toast.promise(ok, {
      loading: 'Loding...',
      success: 'Ученик успешно добавлен в группу',
      error: (e) => e.message,
    })
  }

  return (
    <Form {...form}>
      <form
        className="@container space-y-8"
        onSubmit={form.handleSubmit(onSubmit)}
        id="group-student-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <div className="w-full">
                  <FormLabel>Ученик</FormLabel>
                  <Select onValueChange={(value) => field.onChange(+value)}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Выбрать ученика" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()} className="cursor-pointer">
                          {s.firstName} {s.lastName}
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
