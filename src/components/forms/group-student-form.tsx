'use client'

import { addToGroup } from '@/actions/groups'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { StudentGroupSchema, StudentGroupSchemaType } from '@/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { Student } from '@prisma/client'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface IComboboxProps {
  students: Student[]
  groupId: number
  onSubmit?: () => void
}

export const GroupStudentForm: FC<IComboboxProps> = ({ students, groupId, onSubmit }) => {
  const form = useForm<StudentGroupSchemaType>({
    resolver: zodResolver(StudentGroupSchema),
  })

  function handleSubmit(data: StudentGroupSchemaType) {
    const ok = addToGroup({ studentId: data.studentId, groupId })
    toast.promise(ok, {
      loading: 'Loding...',
      success: 'Ученик успешно добавлен в группу',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <Form {...form}>
      <form
        className="@container space-y-8"
        onSubmit={form.handleSubmit(handleSubmit)}
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
