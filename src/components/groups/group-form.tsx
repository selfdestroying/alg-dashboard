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

import { ICourse } from '@/types/course'
import { createGroup, updateGroup } from '@/actions/groups'
import { toast } from 'sonner'
import { FC } from 'react'
import { IGroups } from '@/types/group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const GroupFormSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters long.' }).trim(),
  course: z.string(),
})

interface IDefaultValues {
  name: string
  course: string
}

interface IGroupFormProps {
  group?: IGroups
  defaultValues: IDefaultValues
  courses: ICourse[]
}

export const GroupForm: FC<IGroupFormProps> = ({ group, defaultValues, courses }) => {
  const form = useForm<z.infer<typeof GroupFormSchema>>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: group
      ? { name: group.name, course: courses.find((i) => i.name == group.course)?.id.toString() }
      : defaultValues,
  })

  const onValid = (values: z.infer<typeof GroupFormSchema>) => {
    let ok
    if (group) {
      ok = updateGroup(group.id, values.name, +values.course)
    } else {
      ok = createGroup(values.name, +values.course)
    }
    toast.promise(ok, { success: 'Group has been created' })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Выберите курс" />
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
        <div className="w-full flex justify-end">
          <Button type="submit" className="cursor-pointer">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}
