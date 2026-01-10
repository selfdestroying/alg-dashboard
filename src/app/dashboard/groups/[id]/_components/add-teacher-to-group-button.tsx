'use client'
import { createTeacherGroup } from '@/actions/groups'
import { getUsers } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Group } from '@prisma/client'
import { Plus } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod/v4'

interface AddTeacherToGroupButtonProps {
  teachers: Awaited<ReturnType<typeof getUsers>>
  group: Group
}

const GroupTeacherSchema = z.object({
  teacherId: z.number('Не выбран преподаватель').int().positive(),
  bid: z
    .number('Не указана ставка')
    .int('Ставка должна быть числом')
    .gte(0, 'Ставка должна быть >= 0')
    .optional(),
  isApplyToLesson: z.boolean(),
})

type GroupTeacherSchemaType = z.infer<typeof GroupTeacherSchema>

export default function AddTeacherToGroupButton({ teachers, group }: AddTeacherToGroupButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<GroupTeacherSchemaType>({
    resolver: zodResolver(GroupTeacherSchema),
    defaultValues: {
      teacherId: undefined,
      bid: group.type === 'INDIVIDUAL' ? 750 : group.type === 'GROUP' ? 1100 : undefined,
      isApplyToLesson: false,
    },
  })

  const handleSubmit = (data: GroupTeacherSchemaType) => {
    startTransition(() => {
      console.log(data)
      const { isApplyToLesson, ...payload } = data
      const ok = createTeacherGroup(
        {
          data: {
            groupId: group.id,
            ...payload,
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

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={'icon-sm'}>
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить преподавателя</DialogTitle>
        </DialogHeader>

        <GroupTeacherForm form={form} teachers={teachers} onSubmit={handleSubmit} />

        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)} size={'sm'}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" form="group-teacher-form" size={'sm'}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface GroupTeacherFormProps {
  form: ReturnType<typeof useForm<GroupTeacherSchemaType>>
  teachers: Awaited<ReturnType<typeof getUsers>>
  onSubmit: (data: GroupTeacherSchemaType) => void
}

function GroupTeacherForm({ form, teachers, onSubmit }: GroupTeacherFormProps) {
  return (
    <form id="group-teacher-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="teacherId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-teacher">Преподаватель</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value?.toString() || ''}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="form-rhf-select-teacher" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите преподавателя" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="bid"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-input-bid">Ставка</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                id="form-rhf-input-bid"
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
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
                  className="hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-2 has-[[aria-checked=true]]:border-violet-600 has-[[aria-checked=true]]:bg-violet-50 dark:has-[[aria-checked=true]]:border-violet-900 dark:has-[[aria-checked=true]]:bg-violet-950"
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
