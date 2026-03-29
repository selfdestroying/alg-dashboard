'use client'

import { CustomCombobox } from '@/src/components/custom-combobox'
import { NumberInput } from '@/src/components/number-input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { getFullName, getGroupName } from '@/src/lib/utils'
import { useMemo } from 'react'
import {
  Controller,
  type FieldValues,
  type Path,
  type UseFormReturn,
  useWatch,
} from 'react-hook-form'
import { useStudentForPaymentListQuery } from '../queries'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import { normalizeDateOnly } from '@/src/lib/timezone'

interface PaymentFormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  formId: string
  disabled?: boolean
}

export default function PaymentForm<T extends FieldValues>({
  form,
  formId,
  disabled,
}: PaymentFormProps<T>) {
  const { data: students = [] } = useStudentForPaymentListQuery()

  const selectedStudent = useWatch({ control: form.control, name: 'studentId' as Path<T> }) as
    | number
    | undefined

  const mappedWallets = useMemo(() => {
    if (!selectedStudent) return []
    const student = students.find((s) => s.id === selectedStudent)
    if (!student) return []
    return student.wallets.map((w) => {
      const groupNames = w.studentGroups.map((sg) => getGroupName(sg.group)).join(', ')
      const label = w.name
        ? `${w.name} (${groupNames || 'без групп'})`
        : groupNames || `Кошелёк #${w.id}`
      return { label, value: w.id }
    })
  }, [selectedStudent, students])

  return (
    <form id={formId}>
      <FieldGroup className="gap-2">
        <Controller
          name={'studentId' as Path<T>}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-student`}>Студент</FieldLabel>
              <CustomCombobox
                items={students}
                getKey={(s) => s.id}
                getLabel={(s) => getFullName(s.firstName, s.lastName)}
                value={students.find((s) => s.id === field.value) || null}
                onValueChange={(s) => s && field.onChange(s.id)}
                id={`${formId}-student`}
                placeholder="Выберите студента"
                emptyText="Нет доступных студентов"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={'wallet' as Path<T>}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-wallet`}>Кошелёк</FieldLabel>
              <CustomCombobox
                items={mappedWallets}
                value={(field.value || null) as { value: number; label: string } | null}
                onValueChange={field.onChange}
                isItemEqualToValue={(a, b) => a?.value === b?.value}
                id={`${formId}-wallet`}
                disabled={!selectedStudent}
                emptyText="Нет доступных кошельков"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name={'lessonCount' as Path<T>}
          disabled={disabled}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-lessonCount`}>Количество занятий</FieldLabel>
              <NumberInput
                id={`${formId}-lessonCount`}
                {...field}
                onChange={field.onChange}
                value={field.value ?? ''}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name={'price' as Path<T>}
          disabled={disabled}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-price`}>Сумма</FieldLabel>
              <NumberInput
                id={`${formId}-price`}
                {...field}
                onChange={field.onChange}
                value={field.value ?? ''}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name={'date' as Path<T>}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Дата</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={<Button variant="outline" className="w-full font-normal" />}
                >
                  <CalendarIcon />
                  {field.value
                    ? field.value
                    : 'Выберите день'}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    onSelect={(value) => value && field.onChange(normalizeDateOnly(value).toISOString().split('T')[0])}
                    locale={ru}
                    selected={field.value}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
