'use client'

import { AttendanceSchema, AttendanceSchemaType } from '@/schemas/attendance'
import { createAttendance } from '@/src/actions/attendance'
import { zodResolver } from '@hookform/resolvers/zod'
import { Student } from '@prisma/client'
import { FC, TransitionStartFunction, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AttendanceFormProps {
  students: Student[]
  lessonId: number
  closeDialog: () => void
  startTransition: TransitionStartFunction
  isPending: boolean
}

export const AttendanceForm: FC<AttendanceFormProps> = ({
  students,
  lessonId,
  closeDialog,
  startTransition,
  isPending,
}) => {
  const id = useId()
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [fullName, setFullName] = useState<string>('')

  const form = useForm<AttendanceSchemaType>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: {
      status: 'UNSPECIFIED',
      studentStatus: 'TRIAL',
      comment: '',
      lessonId: lessonId,
    },
  })

  function handleSubmit(values: AttendanceSchemaType) {
    if (fullName) {
      startTransition(() => {
        const ok = createAttendance(values)
        toast.promise(ok, {
          loading: 'Loding...',
          success: 'Ученик успешно добавлен в урок',
          error: (e) => e.message,
        })
        setFullName('')
        closeDialog()
      })
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      onError={(e) => console.log(e)}
      className="space-y-8"
      id="attendance-form"
    >
      {/* <div className="grid grid-cols-12 gap-4">
        <Controller
          disabled={isPending}
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem className="col-span-12">
              <FormLabel>Ученик</FormLabel>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    size={'sm'}
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    disabled={isPending}
                    className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                  >
                    <span className={cn('truncate', !fullName && 'text-muted-foreground')}>
                      {fullName ?? 'Выберите ученика...'}
                    </span>
                    <ChevronDownIcon
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Выберите ученика..." />
                    <CommandList>
                      <CommandEmpty>Ученики не найдены</CommandEmpty>
                      <CommandGroup>
                        {students.map((student) => (
                          <CommandItem
                            key={student.id}
                            value={`${student.firstName} ${student.lastName}`}
                            onSelect={(currentValue) => {
                              field.onChange(
                                students.find(
                                  (student) =>
                                    currentValue == `${student.firstName} ${student.lastName}`
                                )?.id
                              )
                              setFullName(currentValue === fullName ? '' : currentValue)
                              setPopoverOpen(false)
                            }}
                          >
                            {student.firstName} {student.lastName}
                            {fullName === `${student.firstName} ${student.lastName}` && (
                              <CheckIcon size={16} className="ml-auto" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
          name="studentStatus"
          render={({ field }) => (
            <FormItem className="col-span-12">
              <FormLabel>Статус ученика</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <SelectTrigger className="w-full" size={'sm'}>
                  <SelectValue placeholder="Выберите статус ученика..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRIAL">
                    <div
                      className="inline-block size-2 rounded-full bg-blue-700 dark:bg-blue-300"
                      aria-hidden="true"
                    ></div>
                    Пробный
                  </SelectItem>
                  <SelectItem value="ACTIVE">
                    <div
                      className="inline-block size-2 rounded-full bg-emerald-700 dark:bg-emerald-300"
                      aria-hidden="true"
                    ></div>
                    Ученик
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="col-span-12">
              <FormLabel>Статус посещаемости</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <SelectTrigger className="w-full" size={'sm'}>
                  <SelectValue placeholder="Выберите статус посещаемости..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABSENT">
                    <div
                      className="inline-block size-2 rounded-full bg-red-700 dark:bg-red-300"
                      aria-hidden="true"
                    ></div>
                    Отсутствует
                  </SelectItem>
                  <SelectItem value="UNSPECIFIED">
                    <div
                      className="inline-block size-2 rounded-full bg-gray-700 dark:bg-gray-300"
                      aria-hidden="true"
                    ></div>
                    Не отмечен
                  </SelectItem>
                  <SelectItem value="PRESENT">
                    <div
                      className="inline-block size-2 rounded-full bg-emerald-700 dark:bg-emerald-300"
                      aria-hidden="true"
                    ></div>
                    Присутствует
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Controller
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="col-span-12">
              <FormLabel>Комментарий</FormLabel>
              <Input {...field} disabled={isPending} className="h-8" />
            </FormItem>
          )}
        />
      </div> */}
    </form>
  )
}
