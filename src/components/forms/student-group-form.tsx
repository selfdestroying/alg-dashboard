'use client'

import { addToGroup } from '@/actions/groups'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { GroupsStudentSchema, GroupStudentSchemaType } from '@/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { Group } from '@prisma/client'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface GroupStudenProps {
  groups: Group[]
  studentId: number
  onSubmit?: () => void
}

export const StudentGroupForm: FC<GroupStudenProps> = ({ groups, studentId, onSubmit }) => {
  const form = useForm<GroupStudentSchemaType>({
    resolver: zodResolver(GroupsStudentSchema),
  })

  function handleSubmit(data: GroupStudentSchemaType) {
    const ok = addToGroup({ studentId, groupId: data.groupId }, true)
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
        onSubmit={form.handleSubmit(handleSubmit, (e) => console.log(e))}
        id="student-group-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <div className="w-full">
                  <FormLabel>Грппа</FormLabel>
                  <Select onValueChange={(value) => field.onChange(+value)}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Выбрать группу" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((s) => (
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
