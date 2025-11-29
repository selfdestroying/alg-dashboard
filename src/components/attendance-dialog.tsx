'use client'

import { createAttendance } from '@/actions/attendance'
import { cn } from '@/lib/utils'
import { Student } from '@prisma/client'
import { CheckIcon, ChevronDownIcon, Plus } from 'lucide-react'
import { FC, useId, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useForm } from 'react-hook-form'
import { AttendanceSchema, AttendanceSchemaType } from '@/schemas/attendance'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormMessage } from './ui/form'

interface AttendanceFormProps {
  students: Student[]
  lessonId: number
  onSubmit?: () => void
}

export const AttendanceForm: FC<AttendanceFormProps> = ({ students, lessonId, onSubmit }) => {
  const id = useId()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [fullName, setFullName] = useState<string>('')

  const form = useForm<AttendanceSchemaType>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: {
      status: 'UNSPECIFIED',
      studentStatus: 'TRIAL',
      comment: '',
      lessonId: lessonId
    }
  })

  function handleSubmit(values: AttendanceSchemaType) {
    if (fullName) {
      const ok = createAttendance(values)
      toast.promise(ok, {
        loading: 'Loding...',
        success: 'Ученик успешно добавлен в урок',
        error: (e) => e.message,
      })
      setDialogOpen(false)
      setFullName('')
      onSubmit?.()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} onError={(e) => console.log(e)} className="space-y-8" id="attendance-form">
        <div className="grid grid-cols-12 gap-4">
          <FormField control={form.control} name='studentId' render={({ field }) =>
            <FormItem className='col-span-12'>
              <FormLabel>Ученик</FormLabel>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
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
                              field.onChange(students.find((student) => currentValue == `${student.firstName} ${student.lastName}`)?.id)
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

            </FormItem>} />
        </div>
      </form>
      <FormMessage />
    </Form>
  )
}
