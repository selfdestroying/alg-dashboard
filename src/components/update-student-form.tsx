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
import { updateStudent } from '@/actions/students'
import { IStudent } from '@/types/student'
import { toast } from 'sonner'

const CreateStudentFormSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters long.' }).trim(),
  age: z.number().min(6, { error: 'Minimal age must be 6' }).max(18, 'Maximum age must be 18'),
})

export function UpdateStudentForm({
  student,
  callback,
}: {
  student: IStudent
  callback: () => void
}) {
  const form = useForm<z.infer<typeof CreateStudentFormSchema>>({
    resolver: zodResolver(CreateStudentFormSchema),
    defaultValues: {
      name: student.name,
      age: student.age,
    },
  })

  const onValid = async (values: z.infer<typeof CreateStudentFormSchema>) => {
    const ok = await updateStudent(student.id, values.name, values.age)
    if (!ok) {
      form.setError('root.badRequest', { type: '400' })
    } else {
      callback()
      toast.success('Student has been updated')
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
          name="age"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={6}
                  max={18}
                  onChange={(e) => field.onChange(+e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root?.badRequest && (
          <FormMessage>Invalid username or password</FormMessage>
        )}
        <div className="w-full flex justify-end">
          <Button type="submit">Create Student</Button>
        </div>
      </form>
    </Form>
  )
}
