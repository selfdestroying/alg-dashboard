import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserDTO } from '@/types/user'
import { MoreVertical, Pen } from 'lucide-react'
import { useState } from 'react'
import EditUserForm from './edit-user-dialog'

interface UsersActionsProps {
  user: UserDTO
}

export default function UsersActions({ user }: UsersActionsProps) {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setEditOpen(true)
              setOpen(false)
            }}
          >
            <Pen />
            Редактировать
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="flex flex-col overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">Редактировать</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <div className="px-6">
              <EditUserForm user={user} />
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button form="user-form">Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
