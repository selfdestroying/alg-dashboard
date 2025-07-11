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
import { useForm, UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { formSchema } from '@/schemas/student'
import { apiPost } from '@/actions/api'
import { IStudent } from '@/types/student'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

export default function StudentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'first-name': '',
      'second-name': '',
      age: 0,
    },
  })
  function onReset() {
    form.reset()
    form.clearErrors()
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const body = {
      name: values['first-name'] + ' ' + values['second-name'],
      age: +values.age,
    }
    const ok = apiPost<IStudent>('students', body, 'dashboard/students')
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }

  return (
    <Form {...form}>
      <form
        onReset={onReset}
        className="space-y-8 @container"
        onSubmit={form.handleSubmit(onSubmit)}
        id="student-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="first-name"
            render={({ field }) => (
              <FormItem className="col-span-6 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
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
            name="second-name"
            render={({ field }) => (
              <FormItem className="col-span-6 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
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
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
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
