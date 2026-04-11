'use client'

import { StudentStatus } from '@/prisma/generated/enums'
import { CustomCombobox } from '@/src/components/custom-combobox'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { CalendarCog, CalendarPlus, Loader, MoreVertical, Trash2, UserPen } from 'lucide-react'
import { useState } from 'react'
import { useDeleteAttendanceMutation, useUpdateAttendanceStudentStatusMutation } from '../queries'
import type { AttendanceWithStudents } from '../types'
import { StudentStatusMap } from './attendance-table'
import MakeUpDialog from './create-makeup-dialog'
import { useLessonDetail } from './lesson-detail-context'

const AttendanceActions = ({ attendance }: { attendance: AttendanceWithStudents }) => {
  const { lessonId } = useLessonDetail()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [makeupOpen, setMakeupOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [studentStatus, setStudentStatus] = useState<StudentStatus>(attendance.studentStatus)

  const deleteMutation = useDeleteAttendanceMutation(lessonId)
  const updateStudentStatusMutation = useUpdateAttendanceStudentStatusMutation(lessonId)

  const studentFullName = `${attendance.student.firstName} ${attendance.student.lastName}`

  const handleDelete = () => {
    if (confirmText === studentFullName) {
      deleteMutation.mutate(
        { studentId: attendance.studentId, lessonId: attendance.lessonId },
        {
          onSettled: () => {
            setConfirmOpen(false)
            setConfirmText('')
            setOpen(false)
          },
        },
      )
    }
  }

  const handleStudentStatusConfirm = () => {
    updateStudentStatusMutation.mutate(
      { id: attendance.id, studentStatus },
      {
        onSettled: () => {
          setOpen(false)
          setStatusOpen(false)
        },
      },
    )
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size={'icon'} />}>
          <MoreVertical />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-max">
          <DropdownMenuItem
            onClick={() => {
              setStatusOpen(true)
              setOpen(false)
            }}
          >
            <UserPen />
            Изменить статус ученика
          </DropdownMenuItem>
          {!attendance.makeupForAttendanceId && (
            <DropdownMenuItem
              onClick={() => {
                setMakeupOpen(true)
                setOpen(false)
              }}
            >
              {attendance.makeupAttendance ? (
                <>
                  <CalendarCog />
                  Изменить дату отработки
                </>
              ) : (
                <>
                  <CalendarPlus />
                  Записать на отработку
                </>
              )}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setConfirmOpen(true)
              setOpen(false)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите удалить <strong>{studentFullName}</strong>?
            </AlertDialogTitle>
            <AlertDialogDescription>
              При удалении записи, будут удалены все связанные с ним сущности. Это действие нельзя
              будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="">
            <Label htmlFor="confirm">Введите для подтверждения удаления:</Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={studentFullName}
              className="mt-2"
              autoFocus
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmText('')}>Отмена</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={confirmText !== studentFullName || deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? <Loader className="animate-spin" /> : 'Удалить'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Статус ученика</DialogTitle>
          </DialogHeader>

          <CustomCombobox
            items={[
              { label: StudentStatusMap[StudentStatus.ACTIVE], value: StudentStatus.ACTIVE },
              { label: StudentStatusMap[StudentStatus.TRIAL], value: StudentStatus.TRIAL },
            ]}
            value={{ label: StudentStatusMap[studentStatus], value: studentStatus }}
            onValueChange={(item) => item && setStudentStatus(item.value as StudentStatus)}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button
              onClick={handleStudentStatusConfirm}
              disabled={updateStudentStatusMutation.isPending}
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MakeUpDialog open={makeupOpen} onOpenChange={setMakeupOpen} attendance={attendance} />
    </>
  )
}

export default AttendanceActions
