'use client'
import { AttendanceForm } from '@/components/forms/attendance-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Student } from '@prisma/client'
import { Loader2, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'

interface AttendanceDialogProps {
  lessonId: number
  students: Student[]
}

export default function AttendanceDialog({ lessonId, students }: AttendanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={'sm'} variant={'outline'}>
          <Plus />
          <span className="hidden sm:inline">Добавить ученика</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b p-4 text-base">Добавить ученика</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>

        <div className="overflow-y-auto p-4">
          <AttendanceForm
            lessonId={lessonId}
            students={students}
            closeDialog={() => setOpen(false)}
            startTransition={startTransition}
            isPending={isPending}
          />
        </div>
        <DialogFooter className="border-t p-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </DialogClose>
          <Button form="attendance-form" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
