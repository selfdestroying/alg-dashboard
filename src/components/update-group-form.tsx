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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ICourse } from '@/types/course'
import { toast } from 'sonner'
import { IGroup, IGroups } from '@/types/group'
import { updateGroup } from '@/actions/groups'

const CreateStudentFormSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters long.' }).trim(),
  course: z.string(),
})

export function UpdateGroupForm({
  group,
  courses,
  callback,
}: {
  group: IGroups
  courses: ICourse[]
  callback: () => void
}) {
  const form = useForm<z.infer<typeof CreateStudentFormSchema>>({
    resolver: zodResolver(CreateStudentFormSchema),
    defaultValues: {
      name: group.name,
      course: group.course,
    },
  })

  const onValid = async (values: z.infer<typeof CreateStudentFormSchema>) => {
    const ok = await updateGroup(group.id, values.name, +values.course)
    if (!ok) {
      form.setError('root.badRequest', { type: '400' })
    } else {
      callback()
      toast.success('Group has been updated')
    }
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
        {courses.length != 0 ? (
          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder={courses[0].name} />
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
        ) : (
          <></>
        )}
        {form.formState.errors.root?.badRequest && (
          <FormMessage>Invalid username or password</FormMessage>
        )}
        <div className="w-full flex justify-end">
          <Button type="submit" className="cursor-pointer">
            Create
          </Button>
        </div>
      </form>
    </Form>
  )
}
