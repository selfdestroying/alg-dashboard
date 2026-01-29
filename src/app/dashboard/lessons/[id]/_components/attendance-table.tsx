'use client'
import { useMemo } from 'react'

import { AttendanceWithStudents, updateAttendanceComment } from '@/actions/attendance'
import AttendanceActions from '@/app/dashboard/lessons/[id]/_components/attendance-actions'
import { AttendanceStatusSwitcher } from '@/app/dashboard/lessons/[id]/_components/attendance-status-switcher'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useSkipper from '@/hooks/use-skipper'
import { usePermission } from '@/hooks/usePermission'
import { AttendanceStatus, StudentStatus } from '@prisma/client'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { toZonedTime } from 'date-fns-tz'
import { debounce, DebouncedFunction } from 'es-toolkit'
import Link from 'next/link'
import { toast } from 'sonner'

export const StudentStatusMap: { [key in StudentStatus]: string } = {
  ACTIVE: 'Ученик',
  DISMISSED: 'Отчислен',
  TRIAL: 'Пробный',
}

const getColumns = (
  handleUpdate: DebouncedFunction<
    (studentId: number, lessonId: number, comment?: string, status?: AttendanceStatus) => void
  >
): ColumnDef<AttendanceWithStudents>[] => {
  return [
    {
      header: 'Полное имя',
      accessorFn: (value) => value.studentId,
      cell: ({ row }) => (
        <Link
          href={`/dashboard/students/${row.original.studentId}`}
          className="text-primary hover:underline"
        >
          {`${row.original.student.firstName} ${row.original.student.lastName}`}
        </Link>
      ),
    },
    {
      header: 'Статус ученика',
      cell: ({ row }) => StudentStatusMap[row.original.studentStatus],
    },
    {
      header: 'Статус',
      cell: ({ row }) => <AttendanceStatusSwitcher attendance={row.original} />,
    },
    {
      header: 'Отработка',
      cell: ({ row }) =>
        row.original.asMakeupFor ? (
          <Link
            href={`/dashboard/lessons/${row.original.asMakeupFor.missedAttendance.lessonId}`}
            className="text-primary hover:underline"
          >
            Отработка за{' '}
            {toZonedTime(
              row.original.asMakeupFor.missedAttendance.lesson!.date,
              'Europe/Moscow'
            ).toLocaleDateString('ru-RU')}
          </Link>
        ) : row.original.missedMakeup ? (
          <Link
            href={`/dashboard/lessons/${row.original.missedMakeup.makeUpAttendance.lessonId}`}
            className="text-primary hover:underline"
          >
            Отработка{' '}
            {toZonedTime(
              row.original.missedMakeup.makeUpAttendance.lesson!.date,
              'Europe/Moscow'
            ).toLocaleDateString('ru-RU')}
          </Link>
        ) : null,
    },
    {
      header: 'Комментарий',
      accessorKey: 'comment',
      cell: ({ row }) => (
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

export default function AttendanceTable({ data }: { data: AttendanceWithStudents[] }) {
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

  const canEdit = usePermission('EDIT_ATTENDANCE')

  if (canEdit) {
    columns.push({
      id: 'actions',

      cell: ({ row }) => (
        <div className="flex justify-end">
          <AttendanceActions attendance={row.original} />
        </div>
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
    <div className="flex h-full flex-col gap-2">
      <Table className="overflow-y-auto">
        <TableHeader className="bg-card sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Нет учеников.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
