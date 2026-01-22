'use client'
import { createTeacherLesson } from '@/actions/lessons'
import { getUsers } from '@/actions/users'
import { Button } from '@/components/ui/button'
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePermission } from '@/hooks/usePermission'
import { getFullName } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lesson } from '@prisma/client'
import { Plus } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod/v4'

interface AddTeacherToLessonButtonProps {
  teachers: Awaited<ReturnType<typeof getUsers>>
  lesson: Lesson
}

const LessonTeacherSchema = z.object({
  teacherId: z.number('Не выбран преподаватель').int().positive(),
  bid: z
    .number('Не указана ставка')
    .int('Ставка должна быть числом')
    .gte(0, 'Ставка должна быть >= 0'),
})

type LessonTeacherSchemaType = z.infer<typeof LessonTeacherSchema>

export default function AddTeacherToLessonButton({
  teachers,
  lesson,
}: AddTeacherToLessonButtonProps) {
  const canAdd = usePermission('ADD_GROUPTEACHER')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<LessonTeacherSchemaType>({
    resolver: zodResolver(LessonTeacherSchema),
    defaultValues: {
      teacherId: undefined,
      bid: undefined,
    },
  })

  const handleSubmit = (data: LessonTeacherSchemaType) => {
    startTransition(() => {
      const { ...payload } = data
      const ok = createTeacherLesson({
        data: {
          lessonId: lesson.id,
          ...payload,
        },
      })
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

        <LessonTeacherForm form={form} teachers={teachers} onSubmit={handleSubmit} />

        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)} size={'sm'}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" form="lesson-teacher-form" size={'sm'}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface LessonTeacherFormProps {
  form: ReturnType<typeof useForm<LessonTeacherSchemaType>>
  teachers: Awaited<ReturnType<typeof getUsers>>
  onSubmit: (data: LessonTeacherSchemaType) => void
}

function LessonTeacherForm({ form, teachers, onSubmit }: LessonTeacherFormProps) {
  return (
    <form id="lesson-teacher-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                itemToStringLabel={(itemValue) => {
                  const teacher = teachers.find((t) => t.id === Number(itemValue))
                  return teacher
                    ? getFullName(teacher.firstName, teacher.lastName)
                    : 'Выберите преподавателя'
                }}
              >
                <SelectTrigger id="form-rhf-select-teacher" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите преподавателя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
                value={field.value ?? ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
