'use client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DefaultValues, useForm } from 'react-hook-form'

import { createStudent } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StudentSchema, StudentSchemaType } from '@/schemas/student'
import { zodResolver } from '@hookform/resolvers/zod'
import { Group } from '@prisma/client'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { Checkbox } from '../ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface StudentFormProps {
  type: string
  groups: Group[]
  defaultValues?: DefaultValues<StudentSchemaType>
  onSubmit?: () => void
}

export default function StudentForm({ defaultValues, onSubmit, groups }: StudentFormProps) {
  const id = useId()
  const [fullName, setFullName] = useState<string | undefined>()
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [isAddToGroup, setIsAddToGroup] = useState<boolean>(false)

  const form = useForm<StudentSchemaType>({
    resolver: zodResolver(StudentSchema),
    defaultValues,
  })

  function handleSubmit(values: StudentSchemaType) {
    let groupId
    if (fullName) {
      groupId = groups.find((group) => fullName == group.name)?.id as number
    }
    const ok = createStudent({
      age: values.age,
      firstName: values.firstName,
      lastName: values.lastName,
      parentsName: values.parentsName,
      crmUrl: values.crmUrl,
    }, groupId)
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Ученик успешно добавлен',
      error: (e) => e.message,
    })
    onSubmit?.()
  }

  return (
    <Form {...form}>
      <form
        className="@container space-y-8"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="student-form"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Имя</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" className=" " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="col-span-6 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Фамилия</FormLabel>

                <FormControl>
                  <Input placeholder="" type="text" className=" " {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Возраст</FormLabel>
                <FormControl>
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
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentsName"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">ФИО Родителя</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" className=" " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="crmUrl"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex flex-col items-start gap-2 space-y-0 self-end">
                <FormLabel className="flex shrink-0">Ссылка в amoCRM</FormLabel>
                <FormControl>
                  <Input placeholder="" type="url" className=" " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
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
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                  disabled={!isAddToGroup}
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
                      {groups.map((group) => (
                        <CommandItem
                          key={group.id}
                          value={group.name}
                          onSelect={(currentValue) => {
                            setFullName(currentValue === fullName ? undefined : currentValue)
                            setPopoverOpen(false)
                          }}
                        >
                          {group.name}
                          {fullName === group.name && <CheckIcon size={16} className="ml-auto" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </form>
    </Form>
  )
}
