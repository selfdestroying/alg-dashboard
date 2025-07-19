'use client'

import { apiDelete, apiPut } from '@/actions/api'
import { UserData } from '@/actions/users'
import { AttendanceStatus, IAttendance } from '@/types/attendance'
import { ILesson } from '@/types/lesson'
import { ApiResponse } from '@/types/response'
import { Check, Trash, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './dialogs/alert-dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Lesson } from '@prisma/client'

export default function Attendances({ lesson, user }: { lesson: Lesson; user: UserData }) {
  const [changed, setChanged] = useState<boolean>(true)
  const [attendances, setAttendances] = useState<IAttendance[]>(lesson.attendances)

  const onCommentChange = (studentId: number, comment: string) => {
    setAttendances((prevAttendance) =>
      prevAttendance.map((attendance) =>
        attendance.studentId === studentId ? { ...attendance, comment } : attendance
      )
    )
  }
  const onStatusChange = (studentId: number, newStatus: 'Unspecified' | 'Present' | 'Absent') => {
    setAttendances((prevAttendance) =>
      prevAttendance.map((attendance) =>
        attendance.studentId === studentId
          ? { ...attendance, status: AttendanceStatus[newStatus] }
          : attendance
      )
    )
  }

  useEffect(() => {
    setChanged(attendances.find((a) => a.status == AttendanceStatus.Unspecified) ? true : false)
  }, [attendances])

  function onSubmit() {
    const ok = new Promise<ApiResponse<IAttendance>>((resolve, reject) => {
      const res = apiPut<IAttendance>(
        `attendances/${lesson.id}`,
        { lessonId: lesson.id, attendances: attendances },
        'dashboard/groups'
      )
      res.then((r) => {
        if (r.success) {
          resolve(r)
        } else {
          reject(r)
        }
      })
    })
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
    setChanged(true)
  }

  return (
    <div className="space-y-2">
      {lesson.attendances.map((item) => (
        <div key={item.studentId}>
          <Card className="p-2">
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex-1/2 text-base">{item.student}</CardTitle>
                <div>
                  <Input
                    placeholder="Комментарий"
                    defaultValue={item.comment}
                    onChange={(e) => onCommentChange(item.studentId, e.target.value)}
                    disabled={!user}
                  />
                </div>
                <ToggleGroup
                  type="single"
                  variant={'outline'}
                  defaultValue={AttendanceStatus[item.status]}
                  onValueChange={(value: 'Present' | 'Absent') => {
                    const newStatus = value ? value : 'Unspecified'
                    onStatusChange(item.studentId, newStatus)
                  }}
                  disabled={!user}
                >
                  <ToggleGroupItem
                    value="Present"
                    className="cursor-pointer data-[state=on]:bg-green-300"
                  >
                    <Check className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="Absent"
                    className="cursor-pointer data-[state=on]:bg-red-300"
                  >
                    <X className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      <div className="flex justify-between">
        {user ? <LessonActions lesson={lesson} /> : <div></div>}
        <Button
          disabled={changed || !user}
          variant={'outline'}
          onClick={onSubmit}
          className="cursor-pointer"
        >
          Подтвердить
        </Button>
      </div>
    </div>
  )
}

function LessonActions({ lesson }: { lesson: ILesson }) {
  const handleDelete = () => {
    const ok = new Promise<ApiResponse<boolean>>((resolve, reject) => {
      apiDelete<boolean>(`lessons/${lesson.id}`, {}, `dashboard/groups/${lesson.groupId}`).then(
        (r) => {
          if (r.success) {
            resolve(r)
          } else {
            reject(r)
          }
        }
      )
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex items-center justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size={'icon'}>
              <Trash className="stroke-rose-400" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this contact.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-white shadow-xs"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
