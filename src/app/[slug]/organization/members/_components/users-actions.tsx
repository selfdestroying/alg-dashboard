'use client'

import { Prisma } from '@/prisma/generated/client'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { MoreVertical, Pen } from 'lucide-react'
import { useState } from 'react'
import EditUserButton from './edit-user-dialog'

interface UsersActionsProps {
  member: Prisma.MemberGetPayload<{ include: { user: true } }>
}

export default function UsersActions({ member }: UsersActionsProps) {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-max">
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

      <EditUserButton
        member={member}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
      />
    </>
  )
}
