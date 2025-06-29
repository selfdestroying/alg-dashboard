'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IStudent } from '@/types/student'
import { FC } from 'react'
import { ApiResponse } from '@/types/response'
import { api } from '@/lib/api/api-client'

const FormSchema = z.object({
  studentName: z.string({
    required_error: 'Please select a student.',
  }),
})

interface IComboboxProps {
  students: IStudent[]
  groupId: string
}

export const StudentGroupForm: FC<IComboboxProps> = ({ students, groupId }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const ok = new Promise<ApiResponse<IStudent>>((resolve, reject) => {
      api
        .post<IStudent>(
          'groups/add-student',
          { groupId: groupId, studentId: students.find((s) => s.name == data.studentName)?.id },
          `dashboard/groups/${groupId}`
        )
        .then((r) => {
          if (r.success) {
            resolve(r)
          } else {
            reject(r)
          }
        })
    })
    toast.promise(ok, {
      loading: 'Loding...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Student</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-[200px] justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? students.find((s) => s.name.toString() === field.value)?.name
                        : 'Select student'}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search student..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        {students.map((s) => (
                          <CommandItem
                            value={s.name.toString()}
                            key={s.id}
                            onSelect={() => {
                              form.setValue('studentName', s.name.toString())
                            }}
                          >
                            {s.name}
                            <Check
                              className={cn(
                                'ml-auto',
                                s.name.toString() === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
