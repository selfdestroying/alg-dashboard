'use client'

import { Input } from '@/components/ui/input'
import { Controller, DefaultValues, useForm } from 'react-hook-form'

import { createStudent } from '@/actions/students'
import { CreateStudentSchema, CreateStudentSchemaType } from '@/schemas/student'
import { zodResolver } from '@hookform/resolvers/zod'
import { Group } from '@prisma/client'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { Checkbox } from '../../../../components/ui/checkbox'
import { Field, FieldLabel } from '../../../../components/ui/field'
import { Label } from '../../../../components/ui/label'

interface StudentFormProps {
  type: string
  groups: Group[]
  defaultValues?: DefaultValues<CreateStudentSchemaType>
  onSubmit?: () => void
}

export default function StudentForm({ defaultValues, onSubmit, groups }: StudentFormProps) {
  const id = useId()
  const [fullName, setFullName] = useState<string | undefined>()
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [isAddToGroup, setIsAddToGroup] = useState<boolean>(false)

  const form = useForm<CreateStudentSchemaType>({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues,
  })

  function handleSubmit(values: CreateStudentSchemaType) {
    let groupId
    if (fullName) {
      groupId = groups.find((group) => fullName == group.name)?.id as number
    }
    const ok = createStudent(
      {
        age: values.age,
        firstName: values.firstName,
        lastName: values.lastName,
        parentsName: values.parentsName,
        crmUrl: values.crmUrl,
      },
      groupId
    )
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Ученик успешно добавлен',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <form
      className="@container space-y-8"
      onSubmit={form.handleSubmit(handleSubmit)}
      id="student-form"
    >
      <div className="grid grid-cols-12 gap-4">
        <Controller
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <Field className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Имя</FieldLabel>
              <Input placeholder="" type="text" className=" " {...field} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <Field className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Фамилия</FieldLabel>

              <Input placeholder="" type="text" className=" " {...field} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="age"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Возраст</FieldLabel>
              <Input
                placeholder=""
                {...field}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  try {
                    field.onChange(+e.target.value)
                  } catch {
                    field.onChange(0)
                  }
                }}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="parentsName"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">ФИО Родителя</FieldLabel>
              <Input placeholder="" type="text" className=" " {...field} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="crmUrl"
          render={({ field }) => (
            <Field className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
              <FieldLabel className="flex shrink-0">Ссылка в amoCRM</FieldLabel>
              <Input placeholder="" type="url" className=" " {...field} />
            </Field>
          )}
        />

        <div className="col-span-12 space-y-2">
          <Label className="w-fit">
            <Checkbox
              checked={isAddToGroup}
              onCheckedChange={(checked) => {
                setIsAddToGroup(Boolean(checked))
              }}
            />
            Добавить в группу
          </Label>
        </div>
      </div>
    </form>
  )
}
