'use client'

import { createStudentGroup } from '@/actions/groups'
import { cn } from '@/lib/utils'
import { Student } from '@prisma/client'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface GroupStudenProps {
  students: Student[]
  groupId: number
  onSubmit?: () => void
}

export const GroupStudentDialog: FC<GroupStudenProps> = ({ students, groupId }) => {
  const id = useId()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [fullName, setFullName] = useState<string>()

  function handleSubmit() {
    if (fullName) {
      const ok = createStudentGroup({
        studentId: students.find(
          (student) => fullName == `${student.firstName} ${student.lastName}`
        )?.id as number,
        groupId,
      })
      toast.promise(ok, {
        loading: 'Loding...',
        success: 'Ученик успешно добавлен в группу',
        error: (e) => e.message,
      })
    }
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button />}>Добавить ученика</DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">Добавить ученика</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pt-4 pb-6">
          <div className="*:not-first:mt-2">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
              <PopoverTrigger
                render={
                  <Button
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                  />
                }
              >
                <span className={cn('truncate', !fullName && 'text-muted-foreground')}>
                  {fullName ?? 'Выберите ученика...'}
                </span>
                <ChevronDownIcon
                  size={16}
                  className="text-muted-foreground/80 shrink-0"
                  aria-hidden="true"
                />
              </PopoverTrigger>
              <PopoverContent
                className="border-input w-full min-w-(--radix-popper-anchor-width) p-0"
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
                            setFullName(currentValue === fullName ? undefined : currentValue)
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
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit}>Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
