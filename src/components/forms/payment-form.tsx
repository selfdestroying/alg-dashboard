'use client'
import { createPayment, updateUnprocessedPayment } from '@/actions/payments'
import { updateStudent } from '@/actions/students'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PaymentSchema, PaymentSchemaType } from '@/schemas/payments'
import { zodResolver } from '@hookform/resolvers/zod'
import { Student, UnprocessedPayment } from '@prisma/client'
import { CheckIcon, ChevronDownIcon, Plus } from 'lucide-react'
import { title } from 'process'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

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
        <DialogTrigger asChild>
          <Button variant={'outline'} size={'sm'}>
            <Plus />
            <span className="hidden sm:inline">Добавить оплату</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">{title}</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <div className="overflow-y-auto">
            <div className="px-6 pt-4 pb-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  onReset={onReset}
                  className="@container space-y-8"
                  id="payment-form"
                >
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                      <FormLabel className="flex shrink-0">Ученик</FormLabel>

                      <div className="w-full">
                        <div className="overflow-y-auto">
                          <div className="*:not-first:mt-2">
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
                              <PopoverTrigger asChild>
                                <Button
                                  id={id}
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={popoverOpen}
                                  className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                                >
                                  <span
                                    className={cn('truncate', !fullName && 'text-muted-foreground')}
                                  >
                                    {fullName ?? 'Выберите ученика...'}
                                  </span>
                                  <ChevronDownIcon
                                    size={16}
                                    className="text-muted-foreground/80 shrink-0"
                                    aria-hidden="true"
                                  />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput placeholder="Выберите ученика..." />
                                  <CommandList>
                                    <CommandEmpty>Ученики не найдены</CommandEmpty>
                                    <CommandGroup>
                                      {students.map((student) => (
                                        <CommandItem
                                          key={student.id}
                                          value={`${student.firstName} ${student.lastName}`}
                                          onSelect={(currentValue) => {
                                            setFullName(
                                              currentValue === fullName ? undefined : currentValue
                                            )
                                            setPopoverOpen(false)
                                          }}
                                        >
                                          {student.firstName} {student.lastName}
                                          {fullName ===
                                            `${student.firstName} ${student.lastName}` && (
                                            <CheckIcon size={16} className="ml-auto" />
                                          )}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="lessonCount"
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
                      name="price"
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

                    <FormField
                      control={form.control}
                      name="leadName"
                      render={({ field }) => (
                        <FormItem className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                          <FormLabel className="flex shrink-0">Имя сделки из amoCRM</FormLabel>
                          <FormControl>
                            <Input placeholder="" type="text" className=" " {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                          <FormLabel className="flex shrink-0">Имя товара из amoCRM</FormLabel>
                          <FormControl>
                            <Input placeholder="" type="text" className=" " {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
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
