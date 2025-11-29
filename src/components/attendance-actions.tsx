// components/DeleteDropdown.tsx
'use client'

import { AttendanceWithStudents, deleteAttendance, updateAttendance } from '@/actions/attendance'
import MakeUpForm from '@/components/forms/makeup-form'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StudentStatus } from '@prisma/client'
import { CalendarCog, CalendarPlus, Loader2, MoreVertical, Trash2, UserPen } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const AttendanceActions = ({ attendance }: { attendance: AttendanceWithStudents }) => {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [makeupOpen, setMakeupOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isStudentStatusPending, startStudentStatusTransition] = useTransition()
  const [studentStatus, setStudentStatus] = useState<StudentStatus>(attendance.studentStatus)

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

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
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

      <Dialog open={makeupOpen} onOpenChange={setMakeupOpen}>
        <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">Отработка</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <div className="px-6 pt-4">
              {attendance.missedMakeup ? (
                <MakeUpForm
                  studentId={attendance.studentId}
                  missedAttendanceId={attendance.id}
                  makeUpAttendanceId={attendance.missedMakeup.makeUpAttendaceId}
                />
              ) : (
                <MakeUpForm studentId={attendance.studentId} missedAttendanceId={attendance.id} />
              )}
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

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">Статус ученика</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <div className="px-6 pt-4 pb-6">
              <Select
                defaultValue={studentStatus}
                onValueChange={(e: StudentStatus) => setStudentStatus(e)}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StudentStatus.ACTIVE}>
                    <div className="space-x-2">
                      <div
                        className="inline-block size-2 rounded-full bg-emerald-700 dark:bg-emerald-300"
                        aria-hidden="true"
                      ></div>
                      <span>Ученик</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={StudentStatus.TRIAL}>
                    <div className="space-x-2">
                      <div
                        className="inline-block size-2 rounded-full bg-blue-700 dark:bg-blue-300"
                        aria-hidden="true"
                      ></div>
                      <span>Пробный</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleStudentStatusConfirm} disabled={isStudentStatusPending}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AttendanceActions
