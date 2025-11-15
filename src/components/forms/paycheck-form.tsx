'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'

import { createPaycheck } from '@/actions/paycheck'
import { PaycheckSchema, PaycheckSchemaType } from '@/schemas/paycheck'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface PaycheckFormProps {
  userId: number
  onSubmit?: () => void
}

export default function PaycheckForm({ userId, onSubmit }: PaycheckFormProps) {
  const form = useForm<PaycheckSchemaType>({
    resolver: zodResolver(PaycheckSchema),
    defaultValues: {
      userId,
      comment: '',
      amount: 0,
    },
  })

  function handleSubmit(values: PaycheckSchemaType) {
    const ok = createPaycheck({ data: values })
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Чек успешно добавлен',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <Form {...form}>
      <form
        className="@container space-y-8"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="paycheck-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Сумма</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      className="peer ps-6 pe-12"
                      value={Number(field.value).toString()}
                      type="number"
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) ? Number(e.target.value) : 0)
                      }
                    />
                    <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                      ₽
                    </span>
                    <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
                      RUB
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Комментарий</FormLabel>

                <FormControl>
                  <Input placeholder="" type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>Дата зачисления</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'dd.MM.yyyy') : 'Выбрать дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
