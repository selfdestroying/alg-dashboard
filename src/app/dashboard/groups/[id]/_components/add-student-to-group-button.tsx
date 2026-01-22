'use client'
import { createStudentGroup } from '@/actions/groups'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { usePermission } from '@/hooks/usePermission'
import { getFullName } from '@/lib/utils'
import { StudentDTO } from '@/types/student'
import { zodResolver } from '@hookform/resolvers/zod'
import { Group } from '@prisma/client'
import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod/v4'

interface AddStudentToGroupButtonProps {
  students: StudentDTO[]
  group: Group
}

const GroupStudentSchema = z.object({
  student: z.object(
    {
      label: z.string(),
      value: z.number(),
    },
    'Выберите студента'
  ),
  isApplyToLesson: z.boolean(),
})

type GroupStudentSchemaType = z.infer<typeof GroupStudentSchema>

export default function AddStudentToGroupButton({ students, group }: AddStudentToGroupButtonProps) {
  const canAdd = usePermission('ADD_GROUPSTUDENT')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<GroupStudentSchemaType>({
    resolver: zodResolver(GroupStudentSchema),
    defaultValues: {
      student: undefined,
      isApplyToLesson: false,
    },
  })

  const handleSubmit = (data: GroupStudentSchemaType) => {
    startTransition(() => {
      const { isApplyToLesson, student } = data
      const ok = createStudentGroup(
        {
          data: {
            groupId: group.id,
            studentId: student.value,
          },
        },
        isApplyToLesson
      )
      toast.promise(ok, {
        loading: 'Добавление преподавателя...',
        success: 'Преподаватель успешно добавлен в группу!',
        error: 'Не удалось добавить преподавателя в группу.',
        finally: () => setDialogOpen(false),
      })
    })
  }

  useEffect(() => {
    form.reset()
  }, [dialogOpen, form])

  if (!canAdd) {
    return null
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button size={'icon'} />}>
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить преподавателя</DialogTitle>
        </DialogHeader>

        <GroupStudentForm form={form} students={students} onSubmit={handleSubmit} />

        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)} size={'sm'}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" form="group-student-form" size={'sm'}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface GroupStudentFormProps {
  form: ReturnType<typeof useForm<GroupStudentSchemaType>>
  students: StudentDTO[]
  onSubmit: (data: GroupStudentSchemaType) => void
}

function GroupStudentForm({ form, students, onSubmit }: GroupStudentFormProps) {
  const mappedStudents = useMemo(
    () =>
      students.map((student) => ({
        label: getFullName(student.firstName, student.lastName),
        value: student.id,
      })),
    [students]
  )
  return (
    <form id="group-student-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="student"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="form-rhf-select-student">Студент</FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <Combobox
                items={mappedStudents}
                value={field.value || ''}
                onValueChange={field.onChange}
                isItemEqualToValue={(itemValue, selectedValue) =>
                  itemValue.value === selectedValue.value
                }
              >
                <ComboboxInput id="form-rhf-select-student" aria-invalid={fieldState.invalid} />
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
            </Field>
          )}
        />

        <Controller
          name="isApplyToLesson"
          control={form.control}
          render={({ field }) => (
            <Field>
              <Field orientation="horizontal">
                <FieldLabel
                  htmlFor="toggle-apply-to-lessons"
                  className="hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-2 has-aria-checked:border-violet-600 has-aria-checked:bg-violet-50 dark:has-aria-checked:border-violet-900 dark:has-aria-checked:bg-violet-950"
                >
                  <Checkbox
                    id="toggle-apply-to-lessons"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white dark:data-[state=checked]:border-violet-700 dark:data-[state=checked]:bg-violet-700"
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">Применить к урокам</p>
                  </div>
                </FieldLabel>
              </Field>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
