'use client'
import { dismissStudent } from '@/actions/dismissed'
import { removeFromGroup } from '@/actions/groups'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DismissSchema, DismissSchemaType } from '@/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function DismissForm({
  onSubmit,
  studentId,
  groupId,
}: {
  onSubmit?: () => void
  studentId: number
  groupId: number
}) {
  const form = useForm<DismissSchemaType>({
    resolver: zodResolver(DismissSchema),
    defaultValues: {
      studentId,
      groupId,
      comment: '',
    },
  })

  function handleSubmit(values: DismissSchemaType) {
    const promise = Promise.all([
      dismissStudent({ data: values }),
      removeFromGroup({ groupId: values.groupId, studentId: values.studentId }),
    ])
    toast.promise(promise, {
      loading: 'Создание группы...',
      success: 'Группа успешно создана',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8" id="dismiss-form">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 flex gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Дата отчисления <span className="text-destructive">*</span>
                  </FormLabel>
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

          {/* Backoffice URL */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>Комментарий</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
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
