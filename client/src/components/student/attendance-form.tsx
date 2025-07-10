'use client'

import { ILesson } from '@/types/lesson'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/response'
import { AttendanceStatus, IAttendance } from '@/types/attendance'
import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Card, CardContent, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { IUser } from '@/types/user'
import { LessonActions } from '../lesson/lesson-actions'
import { apiPut } from '@/lib/api/api-server'

export default function AttendanceForm({ lesson, user }: { lesson: ILesson; user: IUser | null }) {
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
