'use client'

import { CustomCombobox } from '@/src/components/custom-combobox'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/src/components/ui/field'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useStudentListQuery } from '@/src/features/students/queries'
import { getFullName } from '@/src/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { useCreateAttendanceMutation } from '../queries'
import { useLessonDetail } from './lesson-detail-context'

const AddAttendanceFormSchema = z.object({
  studentId: z.int('Выберите ученика').positive('Выберите ученика'),
  studentStatus: z.enum(['ACTIVE', 'TRIAL'], 'Выберите статус ученика'),
})

type AddAttendanceFormValues = z.infer<typeof AddAttendanceFormSchema>

const studentStatusMap = {
  ACTIVE: 'Активен',
  TRIAL: 'Пробный',
}

const studentStatusItems = Object.entries(studentStatusMap).map(([value, label]) => ({
  label,
  value,
}))

interface AddAttendanceButtonProps {
  isFull?: boolean
}

export default function AddAttendanceButton({ isFull }: AddAttendanceButtonProps) {
  const { lessonId } = useLessonDetail()
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useCreateAttendanceMutation(lessonId)

  const form = useForm<AddAttendanceFormValues>({
    resolver: zodResolver(AddAttendanceFormSchema),
    defaultValues: {
      studentId: undefined,
      studentStatus: undefined,
    },
  })

  const handleSubmit = (data: AddAttendanceFormValues) => {
    mutate(
      { studentId: data.studentId, studentStatus: data.studentStatus },
      {
        onSettled: () => {
          setOpen(false)
          form.reset()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size={'icon'} disabled={isFull} title={isFull ? 'Урок заполнен' : undefined} />
        }
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить ученика</DialogTitle>
        </DialogHeader>

        <AddAttendanceForm form={form} onSubmit={handleSubmit} />
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Отмена
              </Button>
            }
          />
          <Button form="add-attendance-form" type="submit" disabled={isPending}>
            {isPending && <Loader className="animate-spin" />}
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface AddAttendanceFormProps {
  form: ReturnType<typeof useForm<AddAttendanceFormValues>>
  onSubmit: (data: AddAttendanceFormValues) => void
}

function AddAttendanceForm({ form, onSubmit }: AddAttendanceFormProps) {
  const { data: students, isLoading: isStudentsLoading } = useStudentListQuery()

  if (isStudentsLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <form id="add-attendance-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="studentId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="form-rhf-select-student">Ученик</FieldLabel>

              <CustomCombobox
                items={students || []}
                getKey={(s) => s.id}
                getLabel={(s) => getFullName(s.firstName, s.lastName)}
                value={students?.find((s) => s.id === field.value) || null}
                onValueChange={(s) => s && field.onChange(s.id)}
                id="form-rhf-select-student"
                placeholder="Выберите ученика"
                emptyText="Нет доступных учеников"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="studentStatus"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="form-rhf-select-student-status">Статус</FieldLabel>
              <CustomCombobox
                items={studentStatusItems}
                value={studentStatusItems.find((i) => i.value === field.value) ?? null}
                onValueChange={(item) => item && field.onChange(item.value)}
                id="form-rhf-select-student-status"
                placeholder="Выберите статус ученика"
                emptyText="Нет доступных статусов"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
