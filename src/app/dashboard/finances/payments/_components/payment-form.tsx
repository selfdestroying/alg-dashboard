'use client'
import { createPayment, updateUnprocessedPayment } from '@/actions/payments'
import { updateStudent } from '@/actions/students'

import { Input } from '@/components/ui/input'
import { PaymentSchema, PaymentSchemaType } from '@/schemas/payments'
import { zodResolver } from '@hookform/resolvers/zod'
import { Student, UnprocessedPayment } from '@prisma/client'
import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '../../../../../components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../components/ui/dialog'
import { Field, FieldLabel } from '../../../../../components/ui/field'

export default function PaymentDialogForm({
  students,
  unprocessedPayment,
}: {
  students: Student[]
  unprocessedPayment?: UnprocessedPayment
}) {
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [fullName, setFullName] = useState<string>()
  const [open, setOpen] = useState(false)

  const id = useId()
  const form = useForm<PaymentSchemaType>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      price: 0,
      lessonCount: 0,
      leadName: '',
      productName: '',
    },
  })

  function handleSubmit(values: PaymentSchemaType) {
    const studentId = students.find(
      (student) => fullName == `${student.firstName} ${student.lastName}`
    )?.id as number
    const ok = Promise.all([
      createPayment({
        data: {
          studentId,
          lessonCount: values.lessonCount,
          price: values.price,
          bidForLesson: values.price / values.lessonCount,
          leadName: values.leadName,
          productName: values.productName,
        },
      }),
      updateStudent({
        where: { id: studentId },
        data: {
          lessonsBalance: { increment: values.lessonCount },
          totalLessons: { increment: values.lessonCount },
          totalPayments: { increment: values.price },
        },
      }),
      unprocessedPayment &&
        updateUnprocessedPayment({
          where: { id: unprocessedPayment.id },
          data: { resolved: true },
        }),
    ])
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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant={'outline'} size={'sm'} />}>
          <Plus />
          <span className="hidden sm:inline">Добавить оплату</span>
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">Добавить оплату</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <div className="overflow-y-auto">
            <div className="px-6 pt-4 pb-6">
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                onReset={onReset}
                className="@container space-y-8"
                id="payment-form"
              >
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                    <div className="w-full">
                      <div className="overflow-y-auto">
                        <div className="*:not-first:mt-2"></div>
                      </div>
                    </div>
                  </div>

                  <Controller
                    control={form.control}
                    name="lessonCount"
                    render={({ field }) => (
                      <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                        <FieldLabel className="flex shrink-0">Количество занятий</FieldLabel>

                        <div className="w-full">
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
                        </div>
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                        <FieldLabel className="flex shrink-0">Сумма</FieldLabel>
                        <div className="w-full">
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
                        </div>
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="leadName"
                    render={({ field }) => (
                      <Field className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                        <FieldLabel className="flex shrink-0">Имя сделки из amoCRM</FieldLabel>
                        <Input placeholder="" type="text" className=" " {...field} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <Field className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                        <FieldLabel className="flex shrink-0">Имя товара из amoCRM</FieldLabel>
                        <Input placeholder="" type="text" className=" " {...field} />
                      </Field>
                    )}
                  />
                </div>
              </form>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <DialogClose>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button form="payment-form">Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
