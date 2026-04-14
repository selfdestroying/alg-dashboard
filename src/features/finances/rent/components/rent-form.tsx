'use client'

import { CustomCombobox } from '@/src/components/custom-combobox'
import { NumberInput } from '@/src/components/number-input'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { useMappedLocationListQuery } from '@/src/features/locations/queries'
import { normalizeDateOnly } from '@/src/lib/timezone'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Controller, FieldValues, Path, UseFormReturn } from 'react-hook-form'

interface RentFormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  formId: string
}

export default function RentForm<T extends FieldValues>({ form, formId }: RentFormProps<T>) {
  const { data: locations = [] } = useMappedLocationListQuery()

  return (
    <form id={formId}>
      <FieldGroup>
        {/* Location */}
        <Controller
          control={form.control}
          name={'locationId' as Path<T>}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Локация</FieldLabel>
              <CustomCombobox
                items={locations}
                value={
                  field.value
                    ? (locations.find((l) => l.value === String(field.value)) ?? null)
                    : null
                }
                onValueChange={(item) => field.onChange(item ? Number(item.value) : undefined)}
                placeholder="Выберите локацию"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Start Date */}
        <Controller
          control={form.control}
          name={'startDate' as Path<T>}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Дата начала</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={<Button variant="outline" className="w-full font-normal" />}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {field.value
                    ? format(new Date(field.value as string), 'd MMM yyyy', { locale: ru })
                    : 'Выберите дату'}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value as string) : undefined}
                    onSelect={(value) =>
                      value && field.onChange(normalizeDateOnly(value).toISOString().split('T')[0])
                    }
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* End Date */}
        <Controller
          control={form.control}
          name={'endDate' as Path<T>}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Дата окончания</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={<Button variant="outline" className="w-full font-normal" />}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {field.value
                    ? format(new Date(field.value as string), 'd MMM yyyy', { locale: ru })
                    : 'Выберите дату'}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value as string) : undefined}
                    onSelect={(value) =>
                      value && field.onChange(normalizeDateOnly(value).toISOString().split('T')[0])
                    }
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Amount */}
        <Controller
          control={form.control}
          name={'amount' as Path<T>}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-amount`}>Сумма (₽)</FieldLabel>
              <NumberInput
                id={`${formId}-amount`}
                placeholder="0"
                {...field}
                onChange={field.onChange}
                value={field.value ?? ''}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Comment */}
        <Controller
          control={form.control}
          name={'comment' as Path<T>}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-comment`}>Комментарий</FieldLabel>
              <Input
                id={`${formId}-comment`}
                placeholder="Необязательный комментарий"
                {...field}
                value={field.value ?? ''}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
