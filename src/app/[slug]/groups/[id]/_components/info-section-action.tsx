'use client'

import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Archive, CalendarCog, MoreVertical, Pen } from 'lucide-react'
import { useState } from 'react'
import ArchiveGroupDialog from './archive-group-button'
import EditGroupDialog from './edit-group-button'
import ManageScheduleDialog from './manage-schedule-button'
import { GroupDTO } from './types'

interface InfoSectionActionProps {
  canArchive?: boolean
  group: GroupDTO
}

export default function InfoSectionAction({ canArchive, group }: InfoSectionActionProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setArchiveDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size={'icon'}>
              <MoreVertical />
            </Button>
          }
        />
        <DropdownMenuContent className="w-max" side="left">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Pen />
            Редактировать информацию
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setScheduleDialogOpen(true)}>
            <CalendarCog />
            Расписание и уроки
          </DropdownMenuItem>
          {canArchive && !group.isArchived && (
            <DropdownMenuItem variant="destructive" onClick={() => setArchiveDialogOpen(true)}>
              <Archive className="h-4 w-4" />
              Архивировать
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditGroupDialog
        group={group}
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />
      <ManageScheduleDialog
        groupId={group.id}
        schedules={group.schedules}
        isOpen={isScheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
      />
      <ArchiveGroupDialog
        groupId={group.id}
        isOpen={isArchiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
      />
    </>
  )
}
