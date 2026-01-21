'use client'
import { addDismissed } from '@/actions/dismissed'
import { deleteStudentGroup } from '@/actions/groups'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

import { Input } from '@/components/ui/input'
import { DismissSchema, DismissSchemaType } from '@/schemas/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field, FieldLabel } from '../../../../../components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../components/ui/popover'

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
      addDismissed({ data: values }),
      deleteStudentGroup({ groupId: values.groupId, studentId: values.studentId }),
    ])
    toast.promise(promise, {
      loading: 'Создание группы...',
      success: 'Группа успешно создана',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8" id="dismiss-form">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 flex gap-4">
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <Field className="w-full">
                <FieldLabel>
                  Дата отчисления <span className="text-destructive">*</span>
                </FieldLabel>
                <Popover modal>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'dd.MM.yyyy') : 'Выбрать дату'}
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
              </Field>
            )}
          />
        </div>

        {/* Backoffice URL */}
        <Controller
          control={form.control}
          name="comment"
          render={({ field }) => (
            <Field className="col-span-12">
              <FieldLabel>Комментарий</FieldLabel>
              <Input type="text" {...field} />
            </Field>
          )}
        />
      </div>
    </form>
  )
}
