'use client'

import { LessonWithAttendanceAndGroup } from '@/actions/lessons'
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
import MakeUpForm from '../forms/makeup-form'
import { Button } from '../ui/button'

export default function MakeUpDialog({
  upcomingLessons,
  studentId,
  missedAttendanceId,
}: {
  upcomingLessons: LessonWithAttendanceAndGroup[]
  studentId: number
  missedAttendanceId: number
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={'sm'} variant={'outline'}>
          Назначить отработку
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">Редактирование ученика</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. You can change your photo and set a username.
        </DialogDescription>
        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6">
            <MakeUpForm
              upcomingLessons={upcomingLessons}
              studentId={studentId}
              missedAttendanceId={missedAttendanceId}
            />
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button form="makeup-form">Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
