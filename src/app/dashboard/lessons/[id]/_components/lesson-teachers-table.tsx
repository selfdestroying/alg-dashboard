'use client'
import BalanceBadge from '@/app/dashboard/lessons/[id]/_components/balance-badge'
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
import LessonTeacherActions from './lesson-teachers-actions'

export default function LessonTeachersTable({
  data,
}: {
  data: Prisma.TeacherLessonGetPayload<{ include: { teacher: true } }>[]
}) {
  const canEdit = usePermission('EDIT_TEACHERLESSON')
  const columns: ColumnDef<Prisma.TeacherLessonGetPayload<{ include: { teacher: true } }>>[] =
    useMemo(
      () => [
        {
          header: 'Преподаватель',
          cell: ({ row }) => (
            <Link
              href={`/dashboard/users/${row.original.teacher.id}`}
              className="text-primary hover:underline"
            >
              {getFullName(row.original.teacher.firstName, row.original.teacher.lastName)}
            </Link>
          ),
        },
        {
          header: 'Ставка',
          cell: ({ row }) => <BalanceBadge balance={row.original.bid} />,
        },
        {
          id: 'actions',
          cell: ({ row }) => (canEdit ? <LessonTeacherActions tl={row.original} /> : null),
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
                Нет преподавателей.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
