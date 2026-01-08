'use client'
import { getGroup, updateGroup } from '@/actions/groups'
import { timeSlots } from '@/components/forms/group-form'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/providers/data-provider'
import { editGroupSchema, EditGroupSchemaType } from '@/schemas/group'
import { generateGroupName } from '@/utils/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { GroupType } from '@prisma/client'
import { Pen } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface EditGroupButtonProps {
  group: Awaited<ReturnType<typeof getGroup>>
}

export default function EditGroupButton({ group }: EditGroupButtonProps) {
  const { courses } = useData()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<EditGroupSchemaType>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      courseId: group.courseId,
      locationId: group.locationId || undefined,
      time: group.time || undefined,
      backOfficeUrl: group.backOfficeUrl || undefined,
      type: group.type || undefined,
    },
  })

  const handleSubmit = async (data: EditGroupSchemaType) => {
    startTransition(async () => {
      let groupName: string | undefined = undefined
      const touchedNameParts =
        Object.prototype.hasOwnProperty.call(data ?? {}, 'courseId') ||
        Object.prototype.hasOwnProperty.call(data ?? {}, 'startDate') ||
        Object.prototype.hasOwnProperty.call(data ?? {}, 'time')
      if (touchedNameParts) {
        const course = courses.find((c) => c.id === (data.courseId ?? group.courseId))
        groupName = generateGroupName(
          course?.name || '',
          data.startDate || group.startDate,
          data.time || group.time || ''
        )
      }
      const ok = updateGroup({ where: { id: group.id }, data: { ...data, name: groupName } })

      toast.promise(ok, {
        loading: 'Сохранение изменений...',
        success: 'Группа успешно обновлена!',
        error: 'Ошибка при обновлении группы.',
        finally: () => setDialogOpen(false),
      })
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size={'icon-sm'} variant={'outline'}>
          <Pen />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать группу</DialogTitle>
        </DialogHeader>
        <EditGroupForm form={form} onSubmit={handleSubmit} />
        <DialogFooter>
          <Button variant="secondary">Отмена</Button>
          <Button form="edit-group" disabled={isPending}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface EditGroupFormProps {
  form: ReturnType<typeof useForm<EditGroupSchemaType>>
  onSubmit: (data: EditGroupSchemaType) => void
}

function EditGroupForm({ form, onSubmit }: EditGroupFormProps) {
  const { courses, locations } = useData()
  return (
    <form id="edit-group" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="courseId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-course">Курс</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value?.toString() || ''}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="form-rhf-select-course" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите курс" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="locationId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-location">Локация</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value?.toString() || ''}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="form-rhf-select-location" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите локацию" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="time"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-time">Время</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value?.toString() || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="form-rhf-select-time" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((timeSlot) => (
                    <SelectItem key={timeSlot.time} value={timeSlot.time}>
                      {timeSlot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-type">Тип группы</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value?.toString() || ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="form-rhf-select-type" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key={GroupType.GROUP} value={GroupType.GROUP}>
                    Группа
                  </SelectItem>
                  <SelectItem key={GroupType.INDIVIDUAL} value={GroupType.INDIVIDUAL}>
                    Индив.
                  </SelectItem>
                  <SelectItem key={GroupType.INTENSIVE} value={GroupType.INTENSIVE}>
                    Интенсив
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="backOfficeUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-input-backOfficeUrl">Ссылка в БО</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                id="form-rhf-input-backOfficeUrl"
                type="text"
                placeholder="https://backoffice.example.com"
                {...field}
              />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
