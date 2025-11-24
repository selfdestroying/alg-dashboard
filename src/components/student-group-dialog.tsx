'use client'

import { addToGroup, getGroups, removeFromGroup } from '@/actions/groups'
import { cn } from '@/lib/utils'
import { Group } from '@prisma/client'
import { CheckIcon, ChevronDownIcon, GitCompare } from 'lucide-react'
import { FC, useEffect, useId, useState } from 'react'
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
  variant?: 'button' | 'icon'
  studentId: number
  fromGroupId?: number
}

export const StudentGroupDialog: FC<GroupStudenProps> = ({ studentId, fromGroupId, variant }) => {
  const id = useId()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [fullName, setFullName] = useState<string>()
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    async function fetchGroups() {
      const g = await getGroups()
      setGroups(g)
    }
    fetchGroups()
  }, [])


  function handleSubmit() {
    if (fullName) {
      const ok = Promise.all([addToGroup({
        groupId: groups.find((group) => fullName == group.name)?.id as number,
        studentId,
      }), fromGroupId ? removeFromGroup({
        groupId: fromGroupId,
        studentId,
      }) : Promise.resolve()])
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
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon">
            <GitCompare />
          </Button>
        ) : (
          <Button>Добавить группу</Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">Добавить группу</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pt-4 pb-6">
          <div className="*:not-first:mt-2">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                >
                  <span className={cn('truncate', !fullName && 'text-muted-foreground')}>
                    {fullName ?? 'Выберите группу...'}
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
                  <CommandInput placeholder="Выберите группу..." />
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
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
