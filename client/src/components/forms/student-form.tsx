'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod/v4'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'

import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createStudent } from '@/actions/students'
import { StudentSchema, StudentSchemaType } from '@/schemas/student'

export default function StudentForm() {
  const form = useForm<StudentSchemaType>({
    resolver: zodResolver(StudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: 0,
    },
  })
  function onReset() {
    form.reset()
    form.clearErrors()
  }

  function onSubmit(values: StudentSchemaType) {
    const ok = createStudent({
      age: values.age,
      firstName: values.firstName,
      lastName: values.lastName,
    })
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Ученик успешно создан',
      error: (e) => e.message,
    })
  }

  return (
    <Form {...form}>
      <form
        onReset={onReset}
        className="@container space-y-8"
        onSubmit={form.handleSubmit(onSubmit)}
        id="student-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Имя</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" className=" " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Фамилия</FormLabel>

                <FormControl>
                  <Input placeholder="" type="text" className=" " {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Возраст</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      try {
                        field.onChange(+e.target.value)
                      } catch {
                        field.onChange(0)
                      }
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
