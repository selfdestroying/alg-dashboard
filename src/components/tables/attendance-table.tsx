'use client'
import React, { useMemo, useState } from 'react'

import { AttendanceWithStudents, deleteAttendance, updateAttendance } from '@/actions/attendance'
import { LessonWithAttendanceAndGroup } from '@/actions/lessons'
import { Attendance, AttendanceStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { toast } from 'sonner'
import FormDialog from '../button-dialog'
import DataTable from '../data-table'
import MakeUpForm from '../forms/makeup-form'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import DeleteAction from '../actions/delete-action'

function useSkipper() {
  const shouldSkipRef = React.useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = React.useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  React.useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}

const getColumns = (
  setData: React.Dispatch<React.SetStateAction<AttendanceWithStudents[]>>,
  skipAutoResetPageIndex: () => void,
  upcomingLessons: LessonWithAttendanceAndGroup[]
): ColumnDef<AttendanceWithStudents>[] => [
  {
    header: 'Полное имя',
    accessorKey: 'fullName',
    accessorFn: (value) => `${value.student.firstName} ${value.student.lastName}`,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-2 font-medium">
          <Button asChild variant={'link'} className="h-fit p-0 font-medium">
            <Link href={`/dashboard/students/${row.original.studentId}`}>
              {row.original.student.firstName} {row.original.student.lastName}
            </Link>
          </Button>
          {row.original.asMakeupFor && (
            <Badge variant={'outline'}>
              Отработка за{' '}
              {row.original.asMakeupFor.missedAttendance.lesson!.date.toLocaleDateString('ru', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
              })}
            </Badge>
          )}
        </div>
      </div>
    ),
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: ({ row }) => (
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_auto]">
        <StatusAction
          value={row.original}
          onChange={(val: AttendanceStatus) => {
            skipAutoResetPageIndex()

            setData((prev) => {
              return prev.map((item) => {
                if (item.id === row.original.id) {
                  return {
                    ...item,
                    status: val,
                  }
                }
                return item
              })
            })
          }}
        />
        {row.original.asMakeupFor ? null : row.original.missedMakeup ? (
          <Badge variant={'outline'}>
            Отработка{' '}
            {row.original.missedMakeup.makeUpAttendance.lesson?.date.toLocaleDateString('ru', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })}
          </Badge>
        ) : (
          <FormDialog
            title="Отработка"
            triggerButtonProps={{ variant: 'outline', size: 'sm' }}
            submitButtonProps={{ form: 'makeup-form' }}
            FormComponent={MakeUpForm}
            formComponentProps={{
              upcomingLessons: upcomingLessons.filter(
                (lesson) => !lesson.attendance.some((a) => a.studentId == row.original.studentId)
              ),
              studentId: row.original.studentId,
              missedAttendanceId: row.original.id,
            }}
          />
        )}
      </div>
    ),
    meta: {
      filterVariant: 'select',
      allFilterVariants: Object.keys(StatusMap),
    },
  },
  {
    header: 'Комментарий',
    accessorKey: 'comment',
    cell: ({ row, getValue }) => (
      <CommentAction
        value={getValue() as string}
        onChange={(val: string) => {
          skipAutoResetPageIndex()
          setData((prev) => {
            return prev.map((item) => {
              if (item.id === row.original.id) {
                return {
                  ...item,
                  comment: val,
                }
              }
              return item
            })
          })
        }}
      />
    ),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DeleteAction
        id={row.original.id}
        action={() => deleteAttendance({where: {
          studentId_lessonId: {
            lessonId: row.original.lessonId!,
            studentId: row.original.studentId
          }
        }})}
        confirmationText={`${row.original.student.firstName} ${row.original.student.lastName}`}
      />
    ),
    enableHiding: false,
  }
]

export function AttendanceTable({
  attendance,
  upcomingLessons,
}: {
  attendance: AttendanceWithStudents[]
  upcomingLessons: LessonWithAttendanceAndGroup[]
}) {
  const [data, setData] = React.useState<AttendanceWithStudents[]>(() => attendance)
  const [editedData, setEditedData] = useState<AttendanceWithStudents[]>(attendance)
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  const isModified = useMemo(() => {
    return editedData.some((item, i) => {
      const original = data[i]
      return item.status !== original.status || item.comment !== original.comment
    })
  }, [data, editedData])
  const columns = useMemo<ColumnDef<AttendanceWithStudents>[]>(
    () => getColumns(setEditedData, skipAutoResetPageIndex, upcomingLessons),
    []
  )
  const handleSave = () => {
    const ok = updateAttendance(editedData).then(() => setData(editedData))
    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Посещаемость успешно обновлена',
      error: (e) => e.message,
    })
  }

  return (
    <>
      <Button disabled={!isModified} onClick={handleSave}>
        Сохранить
      </Button>
      <DataTable
        data={editedData}
        columns={columns}
        tableOptions={{
          autoResetPageIndex,
        }}
      />
    </>
  )
}

const StatusMap: { [key in AttendanceStatus]: string } = {
  ABSENT: 'Пропустил',
  PRESENT: 'Пришел',
  UNSPECIFIED: 'Не отмечен',
}

function StatusAction({
  value,
  onChange,
}: {
  value: Attendance
  onChange: (val: AttendanceStatus) => void
}) {
  return (
    <Select
      value={value.status != 'UNSPECIFIED' ? value.status : undefined}
      onValueChange={(e: AttendanceStatus) => onChange(e)}
    >
      <SelectTrigger size="sm" className="w-full">
        <SelectValue placeholder={StatusMap['UNSPECIFIED']} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={AttendanceStatus.PRESENT}>
          <div className="bg-success size-2 rounded-full" aria-hidden="true"></div>
          {StatusMap.PRESENT}
        </SelectItem>
        <SelectItem value={AttendanceStatus.ABSENT}>
          <div className="bg-error size-2 rounded-full" aria-hidden="true"></div>
          {StatusMap.ABSENT}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

function CommentAction({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} />
}
