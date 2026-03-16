'use client'
import { createAttendance } from '@/src/actions/attendance'
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
import { useSessionQuery } from '@/src/data/user/session-query'
import { useStudentListQuery } from '@/src/features/students/queries'
import { getFullName } from '@/src/lib/utils'
import { CreateAttendanceSchema, CreateAttendanceSchemaType } from '@/src/schemas/attendance'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AddAttendanceButtonProps {
  lessonId: number
  isFull?: boolean
}

const studentStatusMap = {
  ACTIVE: 'Активен',
  TRIAL: 'Пробный',
}

const studentStatusItems = Object.entries(studentStatusMap).map(([value, label]) => ({
  label,
  value,
}))

export default function AddAttendanceButton({ lessonId, isFull }: AddAttendanceButtonProps) {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.organizationId ?? undefined
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const form = useForm<CreateAttendanceSchemaType>({
    resolver: zodResolver(CreateAttendanceSchema),
    defaultValues: {
      studentId: undefined,
      studentStatus: undefined,
    },
  })

  const handleSubmit = (data: CreateAttendanceSchemaType) => {
    startTransition(() => {
      const { studentStatus, studentId } = data
      const ok = createAttendance({
        organizationId: organizationId!,
        lessonId,
        studentId: Number(studentId),
        studentStatus: studentStatus,
        status: 'UNSPECIFIED',
        comment: '',
      })

      toast.promise(ok, {
        loading: 'Добавление ученика...',
        success: 'Ученик успешно добавлен в посещаемость',
        error: 'Не удалось добавить ученика в посещаемость',
        finally: () => {
          setOpen(false)
          form.reset()
        },
      })
    })
  }

  if (isSessionLoading) {
    return <Skeleton className="h-full w-full" />
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
  form: ReturnType<typeof useForm<CreateAttendanceSchemaType>>
  onSubmit: (data: CreateAttendanceSchemaType) => void
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
