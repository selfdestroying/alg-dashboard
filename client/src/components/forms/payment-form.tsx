'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useForm } from 'react-hook-form'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { IStudent } from '@/types/student'
import { IGroup } from '@/types/group'
import { apiPost } from '@/actions/api'
import { toast } from 'sonner'

export default function PaymentForm({
  students,
  groups,
}: {
  students: IStudent[]
  groups: IGroup[]
}) {
  const formSchema = z.object({
    student: z.string().min(1, { message: 'This field is required' }),
    group: z.string().min(1, { message: 'This field is required' }),
    classesAmount: z
      .number({
        error: 'This field must be a number',
      })
      .min(1, { message: 'This field is required' })
      .gt(0, { message: 'Must be greater than 0' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student: '',
      group: '',
      classesAmount: 0,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const body = {
      studentId: values.student,
      groupId: values.group,
      classesAmount: values.classesAmount,
    }
    const ok = apiPost('payments', body, '/dashboard/payments')
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }

  function onReset() {
    form.reset()
    form.clearErrors()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={onReset}
        className="space-y-8 @container"
        id="payment-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="student"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Ученик</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select key="select-0" {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Группа</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select key="select-1" {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full ">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="classesAmount"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Количество занятий</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
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
                    </div>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
