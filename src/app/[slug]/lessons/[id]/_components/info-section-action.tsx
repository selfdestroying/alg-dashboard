'use client'

import { Lesson } from '@/prisma/generated/client'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Ban, MoreVertical, Pen, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { CancelLessonDialog, RestoreLessonDialog } from './cancel-lesson-button'
import EditLessonDialog from './edit-lesson-button'

interface InfoSectionActionProps {
  lesson: Lesson
}

export default function InfoSectionAction({ lesson }: InfoSectionActionProps) {
  const [isEditOpen, setEditOpen] = useState(false)
  const [isCancelOpen, setCancelOpen] = useState(false)
  const [isRestoreOpen, setRestoreOpen] = useState(false)

  const isCancelled = lesson.status === 'CANCELLED'

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
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pen />
            Редактировать
          </DropdownMenuItem>
          {isCancelled ? (
            <DropdownMenuItem onClick={() => setRestoreOpen(true)}>
              <RotateCcw />
              Восстановить урок
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onClick={() => setCancelOpen(true)}>
              <Ban />
              Отменить урок
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditLessonDialog lesson={lesson} isOpen={isEditOpen} onClose={() => setEditOpen(false)} />
      <CancelLessonDialog
        lesson={lesson}
        isOpen={isCancelOpen}
        onClose={() => setCancelOpen(false)}
      />
      <RestoreLessonDialog
        lesson={lesson}
        isOpen={isRestoreOpen}
        onClose={() => setRestoreOpen(false)}
      />
    </>
  )
}
