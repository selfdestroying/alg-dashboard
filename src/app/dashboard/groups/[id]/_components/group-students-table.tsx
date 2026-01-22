'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePermission } from '@/hooks/usePermission'
import { getFullName } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo } from 'react'
import GroupStudentActions from './group-students-actions'

type StudentWithAttendances = Prisma.StudentGroupGetPayload<{
  include: {
    student: {
      include: {
        attendances: {
          where: { lesson: { groupId: number } }
          include: {
            lesson: true
            asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
            missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
          }
        }
      }
    }
  }
}>

export default function GroupStudentsTable({ data }: { data: StudentWithAttendances[] }) {
  const canEdit = usePermission('EDIT_GROUPSTUDENT')
  const columns: ColumnDef<StudentWithAttendances>[] = useMemo(
    () => [
      {
        id: 'id',
        header: '№',
        cell: ({ row }) => row.index + 1,
        size: 10,
      },
      {
        header: 'Полное имя',
        accessorFn: (student) => getFullName(student.student.firstName, student.student.lastName),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/students/${row.original.student.id}`}
            className="text-primary hover:underline"
          >
            {getFullName(row.original.student.firstName, row.original.student.lastName)}
          </Link>
        ),
      },
      {
        header: 'Ссылка в amo',
        cell: ({ row }) =>
          row.original.student.crmUrl ? (
            <a
              href={row.original.student.crmUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {row.original.student.crmUrl ? 'Ссылка' : 'Нет ссылки'}
            </a>
          ) : (
            'Нет ссылки'
          ),
      },
      {
        header: 'Возраст',
        cell: ({ row }) => row.original.student.age,
      },
      {
        header: 'Логин',
        cell: ({ row }) => row.original.student.login,
      },
      {
        header: 'Пароль',
        cell: ({ row }) => row.original.student.password,
      },
      {
        header: 'Коины',
        cell: ({ row }) => row.original.student.coins,
      },
      {
        id: 'actions',
        cell: ({ row }) => (canEdit ? <GroupStudentActions sg={row.original} /> : null),
      },
    ],
    [canEdit]
  )
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
