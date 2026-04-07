'use client'
import { useMemo } from 'react'

import { AttendanceStatus, StudentStatus } from '@/prisma/generated/enums'
import { AttendanceWithStudents, updateAttendanceComment } from '@/src/actions/attendance'
import DataTable from '@/src/components/data-table'
import { Hint } from '@/src/components/hint'
import { Input } from '@/src/components/ui/input'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import useSkipper from '@/src/hooks/use-skipper'
import { formatDateOnly } from '@/src/lib/timezone'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { debounce, DebouncedFunction } from 'es-toolkit'
import Link from 'next/link'
import { toast } from 'sonner'
import AttendanceActions from './attendance-actions'
import { AttendanceStatusSwitcher } from './attendance-status-switcher'

export const StudentStatusMap: { [key in StudentStatus]: string } = {
  ACTIVE: 'Ученик',
  DISMISSED: 'Отчислен',
  TRIAL: 'Пробный',
  TRANSFERRED: 'Переведён',
}

function AttendanceActionsCell({
  attendance,
  isCancelled,
}: {
  attendance: AttendanceWithStudents
  isCancelled?: boolean
}) {
  const { data: hasPermission } = useOrganizationPermissionQuery({ studentLesson: ['update'] })
  if (!hasPermission?.success || isCancelled) return null
  return (
    <div className="flex justify-end">
      <AttendanceActions attendance={attendance} />
    </div>
  )
}

const getColumns = (
  handleUpdate: DebouncedFunction<
    (studentId: number, lessonId: number, comment?: string, status?: AttendanceStatus) => void
  >,
  isCancelled?: boolean,
): ColumnDef<AttendanceWithStudents>[] => {
  return [
    {
      header: 'Полное имя',
      accessorFn: (value) => value.studentId,
      cell: ({ row }) => (
        <Link href={`/students/${row.original.studentId}`} className="text-primary hover:underline">
          {`${row.original.student.firstName} ${row.original.student.lastName}`}
        </Link>
      ),
    },
    {
      id: 'studentStatus',
      header: () => (
        <span className="flex items-center gap-0.5">
          Статус ученика
          <Hint text="Статус ученика в группе: «Ученик» (активный, списывается баланс), «Пробный» (без списания), «Отчислен» или «Переведён»." />
        </span>
      ),
      cell: ({ row }) => StudentStatusMap[row.original.studentStatus],
    },
    {
      header: 'Статус',
      cell: ({ row }) => (
        <AttendanceStatusSwitcher attendance={row.original} disabled={isCancelled} />
      ),
    },
    {
      id: 'makeup',
      header: () => (
        <span className="flex items-center gap-0.5">
          Отработка
          <Hint text="Связь с отработкой: если ученик пропустил урок - ссылка на урок-отработку. Если пришёл на отработку - ссылка на пропущенный урок." />
        </span>
      ),
      cell: ({ row }) =>
        row.original.makeupForAttendance ? (
          <Link
            href={`/lessons/${row.original.makeupForAttendance.lessonId}`}
            className="text-primary hover:underline"
          >
            Отработка за {formatDateOnly(row.original.makeupForAttendance.lesson!.date)}
          </Link>
        ) : row.original.makeupAttendance ? (
          <Link
            href={`/lessons/${row.original.makeupAttendance.lessonId}`}
            className="text-primary hover:underline"
          >
            Отработка {formatDateOnly(row.original.makeupAttendance.lesson!.date)}
          </Link>
        ) : null,
    },
    {
      header: 'Комментарий',
      accessorKey: 'comment',
      cell: ({ row }) =>
        isCancelled ? (
          <span className="text-muted-foreground text-sm">{row.original.comment || '—'}</span>
        ) : (
          <Input
            defaultValue={row.original.comment}
            onChange={(e) =>
              handleUpdate(row.original.studentId, row.original.lessonId, e.target.value)
            }
          />
        ),
    },
  ]
}

export default function AttendanceTable({
  data,
  isCancelled,
}: {
  data: AttendanceWithStudents[]
  isCancelled?: boolean
}) {
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
    [skipAutoResetPageIndex],
  )
  const columns = getColumns(handleUpdate, isCancelled)

  if (!isCancelled) {
    columns.push({
      id: 'actions',
      cell: ({ row }) => (
        <AttendanceActionsCell attendance={row.original} isCancelled={isCancelled} />
      ),
      size: 50,
    })
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex,
  })

  return (
    <div className={isCancelled ? 'opacity-60' : undefined}>
      <DataTable table={table} emptyMessage="Нет учеников." />
    </div>
  )
}
