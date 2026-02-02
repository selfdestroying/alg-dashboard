// components/DeleteDropdown.tsx
'use client'

import {
  AttendanceWithStudents,
  createAttendance,
  deleteAttendance,
  updateAttendance,
} from '@/actions/attendance'
import { createMakeUp } from '@/actions/makeup'
import { updateStudent } from '@/actions/students'
import { StudentStatusMap } from '@/app/dashboard/lessons/[id]/_components/attendance-table'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StudentLessonsBalanceChangeReason, StudentStatus } from '@prisma/client'
import { CalendarCog, CalendarPlus, Loader2, MoreVertical, Trash2, UserPen } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import CreateMakeUpForm from './create-makeup-dialog'

const AttendanceActions = ({ attendance }: { attendance: AttendanceWithStudents }) => {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [makeupOpen, setMakeupOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isStudentStatusPending, startStudentStatusTransition] = useTransition()
  const [studentStatus, setStudentStatus] = useState<StudentStatus>(attendance.studentStatus)

  const [selectedLesson, setSelectedLesson] = useState<{ label: string; value: number } | null>(
    null
  )

  const studentFullName = `${attendance.student.firstName} ${attendance.student.lastName}`

  const handleDelete = () => {
    if (confirmText === studentFullName) {
      startTransition(() => {
        const ok = deleteAttendance({
          where: {
            studentId_lessonId: {
              lessonId: attendance.lessonId!,
              studentId: attendance.studentId,
            },
          },
        })
        toast.promise(ok, {
          loading: 'Загрузка...',
          success: 'Ученик успешно удален',
          error: (e) => e.message,
        })
        setConfirmOpen(false)
        setConfirmText('')
        setOpen(false)
      })
    }
  }

  const handleStudentStatusConfirm = () => {
    startStudentStatusTransition(() => {
      const ok = updateAttendance({ where: { id: attendance.id }, data: { studentStatus } })
      toast.promise(ok, {
        loading: 'Загрузка...',
        success: 'Успешно!',
        error: (e) => e.message,
      })
      setOpen(false)
      setStatusOpen(false)
    })
  }

  const handleCreateMakeUp = () => {
    console.log(selectedLesson)
    try {
      if (!selectedLesson) {
        toast.error('Пожалуйста, выберите урок для отработки.')
        return
      }
      toast.promise(
        (async () => {
          if (attendance.missedMakeup && attendance.missedMakeup.makeUpAttendaceId)
            await deleteAttendance({ where: { id: attendance.missedMakeup.makeUpAttendaceId } })
          const a = await createAttendance({
            studentId: attendance.studentId,
            lessonId: selectedLesson?.value,
            comment: '',
            status: 'UNSPECIFIED',
          })
          await createMakeUp({
            missedAttendanceId: attendance.id,
            makeUpAttendaceId: a.id,
          })
          await updateStudent(
            {
              where: { id: attendance.studentId },
              data: { lessonsBalance: { increment: 1 } },
            },
            {
              lessonsBalance: {
                reason: StudentLessonsBalanceChangeReason.MAKEUP_GRANTED,
                meta: {
                  missedAttendanceId: attendance.id,
                  makeUpAttendaceId: a.id,
                  makeUpLessonId: selectedLesson?.value,
                  makeUpLessonName: selectedLesson.label,
                },
              },
            }
          )
        })(),
        {
          loading: 'Сохраняем...',
          success: 'Отработка успешно создана',
          error: (e) => e.message,
        }
      )
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" />}>
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
          {!attendance.asMakeupFor && (
            <DropdownMenuItem
              onClick={() => {
                setMakeupOpen(true)
                setOpen(false)
              }}
            >
              {attendance.missedMakeup ? (
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
              disabled={confirmText !== studentFullName || isPending}
              onClick={handleDelete}
            >
              {isPending ? <Loader2 className="animate-spin" /> : 'Удалить'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Статус ученика</DialogTitle>
          </DialogHeader>

          <Select
            value={studentStatus}
            onValueChange={(value) => setStudentStatus(value as StudentStatus)}
            itemToStringLabel={(itemValue) => StudentStatusMap[itemValue as StudentStatus]}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={StudentStatus.ACTIVE}>Ученик</SelectItem>
                <SelectItem value={StudentStatus.TRIAL}>Пробный</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button onClick={handleStudentStatusConfirm} disabled={isStudentStatusPending}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={makeupOpen} onOpenChange={setMakeupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отработка</DialogTitle>
          </DialogHeader>
          <CreateMakeUpForm selectedLesson={selectedLesson} setSelectedLesson={setSelectedLesson} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Отмена</DialogClose>
            <Button onClick={handleCreateMakeUp}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AttendanceActions
