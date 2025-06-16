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
import { createGroup } from '@/actions/groups'
import { toast } from 'sonner'

const CreateStudentFormSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters long.' }).trim(),
  course: z.string(),
})

export function CreateGroupForm({
  callback,
  courses,
}: {
  callback: () => void
  courses: ICourse[]
}) {
  const form = useForm<z.infer<typeof CreateStudentFormSchema>>({
    resolver: zodResolver(CreateStudentFormSchema),
    defaultValues: {
      name: '',
      course: courses[0].id.toString(),
    },
  })

  const onValid = async (values: z.infer<typeof CreateStudentFormSchema>) => {
    console.log(values.course)
    const ok = await createGroup(values.name, +values.course)
    if (!ok) {
      form.setError('root.badRequest', { type: '400' })
    } else {
      callback()
      toast.success('Group has been created')
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
