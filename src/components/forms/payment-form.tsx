'use client'
import { GroupWithTeacherAndCourse } from '@/actions/groups'
import { createPayment } from '@/actions/payments'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaymentSchema, PaymentSchemaType } from '@/schemas/payments'
import { zodResolver } from '@hookform/resolvers/zod'
import { Student } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Checkbox } from '../ui/checkbox'

export default function PaymentForm({
  students,
  groups,
}: {
  students: Student[]
  groups: GroupWithTeacherAndCourse[]
}) {
  const form = useForm<PaymentSchemaType>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: { isAddToGroup: true },
  })

  function onSubmit(values: PaymentSchemaType) {
    const ok = createPayment(
      {
        studentId: values.studentId,
        groupId: values.groupId,
        lessonsPaid: values.lessonsPaid,
        amount: values.amount,
      },
      values.isAddToGroup
    )
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Оплата успешно создана',
      error: (e) => e.message,
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
        className="@container space-y-8"
        id="payment-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Ученик</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select key="select-0" onValueChange={(value) => field.onChange(+value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.firstName} {student.lastName}
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
            name="groupId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Группа</FormLabel>
                <div className="w-full">
                  <FormControl>
                    <Select key="select-1" onValueChange={(value) => field.onChange(+value)}>
                      <SelectTrigger className="w-full">
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
            name="isAddToGroup"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <div className="w-full">
                  <FormControl>
                    <div className="relative flex w-full items-center gap-2">
                      <Checkbox
                        defaultChecked={field.value}
                        onCheckedChange={(checked) => {
                          return checked ? field.onChange(true) : field.onChange(false)
                        }}
                      />
                      <FormLabel className="flex shrink-0">Добавить в группу</FormLabel>
                    </div>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lessonsPaid"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Количество занятий</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        name={field.name}
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
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Сумма</FormLabel>
                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        name={field.name}
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
