'use client'
import { updateGroup } from '@/actions/groups'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/usePermission'
import { DaysOfWeek } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
import { editGroupSchema, EditGroupSchemaType } from '@/schemas/group'
import { GroupDTO } from '@/types/group'
import { zodResolver } from '@hookform/resolvers/zod'
import { GroupType } from '@prisma/client'
import { AlertTriangle, Pen } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { timeSlots } from '../../_components/create-group-dialog'

interface EditGroupButtonProps {
  group: GroupDTO
}

export default function EditGroupButton({ group }: EditGroupButtonProps) {
  const canEdit = usePermission('EDIT_GROUP')
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<EditGroupSchemaType>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      courseId: group.courseId,
      locationId: group.locationId!,
      time: group.time!,
      backOfficeUrl: group.backOfficeUrl ?? '',
      type: group.type!,
      dayOfWeek: group.dayOfWeek!,
    },
  })

  const handleSubmit = (data: EditGroupSchemaType) => {
    startTransition(() => {
      const ok = updateGroup({ where: { id: group.id }, data })
      toast.promise(ok, {
        loading: 'Сохранение изменений...',
        success: 'Группа успешно обновлена!',
        error: 'Ошибка при обновлении группы.',
        finally: () => setDialogOpen(false),
      })
    })
  }
  if (!canEdit) {
    return null
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button size={'icon'} />}>
        <Pen />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать группу</DialogTitle>
        </DialogHeader>
        <EditGroupForm form={form} onSubmit={handleSubmit} />
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDialogOpen(false)} size={'sm'}>
            Отмена
          </Button>
          <Button form="edit-group-form" type="submit" disabled={isPending} size={'sm'}>
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
    <form id="edit-group-form" onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}>
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
                itemToStringLabel={(itemValue) =>
                  courses.find((course) => course.id === Number(itemValue))?.name || ''
                }
              >
                <SelectTrigger id="form-rhf-select-course" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите курс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
                itemToStringLabel={(itemValue) =>
                  locations.find((location) => location.id === Number(itemValue))?.name || ''
                }
              >
                <SelectTrigger id="form-rhf-select-location" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите локацию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
                value={field.value != undefined ? field.value.toString() : ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="form-rhf-select-time" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {timeSlots.map((timeSlot) => (
                      <SelectItem key={timeSlot.value} value={timeSlot.value}>
                        {timeSlot.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
                itemToStringLabel={(itemValue) =>
                  itemValue === GroupType.GROUP
                    ? 'Группа'
                    : itemValue === GroupType.INDIVIDUAL
                      ? 'Индив.'
                      : itemValue === GroupType.INTENSIVE
                        ? 'Интенсив'
                        : ''
                }
              >
                <SelectTrigger id="form-rhf-select-type" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem key={GroupType.GROUP} value={GroupType.GROUP}>
                      Группа
                    </SelectItem>
                    <SelectItem key={GroupType.INDIVIDUAL} value={GroupType.INDIVIDUAL}>
                      Индив.
                    </SelectItem>
                    <SelectItem key={GroupType.INTENSIVE} value={GroupType.INTENSIVE}>
                      Интенсив
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="dayOfWeek"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="form-rhf-select-dayOfWeek">День занятия</FieldLabel>
                  <Tooltip>
                    <TooltipTrigger
                      render={<span className="text-warning cursor-help" aria-label="Бета" />}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <b>Тестовая функция.</b> При изменении этого поля будут пересчитаны будущие
                      уроки.
                    </TooltipContent>
                  </Tooltip>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value?.toString() || ''}
                onValueChange={(value) => field.onChange(Number(value))}
                itemToStringLabel={(itemValue) => DaysOfWeek.full[Number(itemValue)]}
              >
                <SelectTrigger id="form-rhf-select-dayOfWeek" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Выберите день недели" />
                </SelectTrigger>
                <SelectContent>
                  {DaysOfWeek.full.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
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
