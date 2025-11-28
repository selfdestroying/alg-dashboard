'use client'
import React, { useMemo } from 'react'

import { AttendanceWithStudents, updateAttendanceComment } from '@/actions/attendance'
import AttendanceActions from '@/app/playground/attendance-actions'
import { AttendanceStatusSwitcher } from '@/app/playground/attendance-status-switcher'
import { AttendanceStatus, StudentStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { debounce, DebouncedFunction } from 'es-toolkit'
import Link from 'next/link'
import { toast } from 'sonner'
import DataTable from '../data-table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const StudentStatusMap: { [key in StudentStatus]: string } = {
  ACTIVE: 'Ученик',
  DISMISSED: 'Отчислен',
  TRIAL: 'Пробный',
}

const AttendanceStatusVariantMap: { [key in AttendanceStatus]: 'success' | 'error' | 'outline' } = {
  PRESENT: 'success',
  ABSENT: 'error',
  UNSPECIFIED: 'outline',
}

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
  // setData: React.Dispatch<React.SetStateAction<AttendanceWithStudents[]>>,
  handleUpdate: DebouncedFunction<
    (studentId: number, lessonId: number, comment?: string, status?: AttendanceStatus) => void
  >
): ColumnDef<AttendanceWithStudents>[] => {
  return [
    {
      header: 'Полное имя',
      accessorKey: 'fullName',
      accessorFn: (value) => `${value.student.firstName} ${value.student.lastName}`,
      cell: ({ row }) => (
        <Button asChild variant={'link'} className="h-fit p-0 font-medium">
          <Link href={`/dashboard/students/${row.original.studentId}`}>
            {row.original.student.firstName} {row.original.student.lastName}
          </Link>
        </Button>
      ),
    },
    {
      header: 'Статус ученика',
      accessorKey: 'studentStatus',
      cell: ({ row }) => (
        <Badge variant={row.original.studentStatus === 'ACTIVE' ? 'success' : 'info'}>
          {StudentStatusMap[row.original.studentStatus]}
        </Badge>
      ),
    },
    {
      header: 'Статус',
      accessorKey: 'status',
      cell: ({ row }) => (
        <AttendanceStatusSwitcher
          lessonId={row.original.lessonId}
          studentId={row.original.studentId}
          status={row.original.status}
        />
      ),
    },
    {
      header: 'Отработка',
      cell: ({ row }) =>
        row.original.asMakeupFor ? (
          <Badge asChild variant={'info'}>
            <Link href={`/dashboard/lessons/${row.original.asMakeupFor.missedAttendance.lessonId}`}>
              Отработка за{' '}
              {row.original.asMakeupFor.missedAttendance.lesson!.date.toLocaleDateString('ru', {
                month: '2-digit',
                day: '2-digit',
              })}
            </Link>
          </Badge>
        ) : row.original.missedMakeup ? (
          <Badge
            asChild
            variant={AttendanceStatusVariantMap[row.original.missedMakeup.makeUpAttendance.status]}
          >
            <Link
              href={`/dashboard/lessons/${row.original.missedMakeup.makeUpAttendance.lessonId}`}
            >
              Отработка{' '}
              {row.original.missedMakeup.makeUpAttendance.lesson!.date.toLocaleDateString('ru', {
                month: '2-digit',
                day: '2-digit',
              })}
            </Link>
          </Badge>
        ) : null,
    },
    {
      header: 'Комментарий',
      accessorKey: 'comment',
      cell: ({ row }) => (
        <Input
          className="h-8"
          defaultValue={row.original.comment}
          onChange={(e) =>
            handleUpdate(row.original.studentId, row.original.lessonId, e.target.value)
          }
        />
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <AttendanceActions attendance={row.original} />,
    },
  ]
}

export function AttendanceTable({ attendance }: { attendance: AttendanceWithStudents[] }) {
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  const handleUpdate = useMemo(
    () =>
      debounce((studentId: number, lessonId: number, comment?: string) => {
        skipAutoResetPageIndex()
        const ok = updateAttendanceComment({
          where: {
            studentId_lessonId: {
              studentId: studentId,
              lessonId: lessonId,
            },
          },
          data: {
            comment,
          },
        })
        toast.promise(ok, {
          loading: 'Загрузка...',
          success: 'Успешно!',
          error: (e) => e.message,
        })
      }, 500),
    [skipAutoResetPageIndex]
  )
  const columns = getColumns(handleUpdate)

  return (
    <DataTable
      paginate={false}
      data={attendance}
      columns={columns}
      tableOptions={{
        autoResetPageIndex,
      }}
    />
  )
}
