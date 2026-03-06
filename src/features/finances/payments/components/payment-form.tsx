'use client'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/src/components/ui/combobox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
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

  const mappedStudents = useMemo(
    () =>
      students.map((student) => ({
        label: getFullName(student.firstName, student.lastName),
        value: student.id,
      })),
    [students],
  )

  const selectedStudent = useWatch({ control: form.control, name: 'student' as Path<T> }) as
    | { value: number; label: string }
    | undefined

  const mappedGroups = useMemo(() => {
    if (!selectedStudent?.value) return []
    const student = students.find((s) => s.id === selectedStudent.value)
    if (!student) return []
    return student.groups.map((sg) => ({
      label: getGroupName(sg.group),
      value: sg.groupId,
    }))
  }, [selectedStudent, students])

  return (
    <form id={formId}>
      <FieldGroup className="gap-2">
        <Controller
          name={'student' as Path<T>}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-student`}>Студент</FieldLabel>
              <Combobox
                items={mappedStudents}
                value={(field.value || null) as { value: number; label: string } | null}
                onValueChange={field.onChange}
                isItemEqualToValue={(a, b) => a?.value === b?.value}
              >
                <ComboboxInput id={`${formId}-student`} aria-invalid={fieldState.invalid} />
                <ComboboxContent>
                  <ComboboxEmpty>Нет доступных студентов</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={'group' as Path<T>}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-group`}>Группа</FieldLabel>
              <Combobox
                items={mappedGroups}
                value={(field.value || null) as { value: number; label: string } | null}
                onValueChange={field.onChange}
                isItemEqualToValue={(a, b) => a?.value === b?.value}
              >
                <ComboboxInput
                  id={`${formId}-group`}
                  aria-invalid={fieldState.invalid}
                  disabled={!selectedStudent?.value}
                />
                <ComboboxContent>
                  <ComboboxEmpty>Нет доступных групп</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
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
              <Input
                id={`${formId}-lessonCount`}
                {...field}
                type="number"
                onChange={(e) => field.onChange(Number(e.target.value))}
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
              <Input
                id={`${formId}-price`}
                {...field}
                type="number"
                onChange={(e) => field.onChange(Number(e.target.value))}
                value={field.value ?? ''}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name={'leadName' as Path<T>}
          disabled={disabled}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-leadName`}>Имя лида</FieldLabel>
              <Input
                id={`${formId}-leadName`}
                {...field}
                type="text"
                onChange={(e) => field.onChange(e.target.value)}
                value={field.value ?? ''}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name={'productName' as Path<T>}
          disabled={disabled}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-productName`}>Название продукта</FieldLabel>
              <Input
                id={`${formId}-productName`}
                {...field}
                type="text"
                onChange={(e) => field.onChange(e.target.value)}
                value={field.value ?? ''}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
