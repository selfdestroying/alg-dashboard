'use client'
import { getFullName } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table'

type StudentWithAttendances = Prisma.StudentGetPayload<{
  include: {
    groups: true

    attendances: {
      where: { lesson: { groupId: number } }
      include: {
        lesson: true
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
      }
    }
  }
}>

const columns: ColumnDef<StudentWithAttendances>[] = [
  {
    id: 'id',
    header: '№',
    cell: ({ row }) => row.index + 1,
    size: 10,
  },
  {
    header: 'Полное имя',
    accessorFn: (student) => `${student.firstName} ${student.lastName}`,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/students/${row.original.id}`}
        className="text-primary hover:underline"
      >
        {getFullName(row.original.firstName, row.original.lastName)}
      </Link>
    ),
    meta: { filterVariant: 'text' },
  },
  { header: 'Возраст', accessorKey: 'age', meta: { filterVariant: 'range' } },
  { header: 'ФИО Родителя', accessorKey: 'parentsName', meta: { filterVariant: 'text' } },
  {
    header: 'Ссылка в amoCRM',
    accessorKey: 'crmUrl',
    cell: ({ row }) => (
      <a
        target="_blank"
        href={row.getValue('crmUrl') || '#'}
        className="text-primary hover:underline"
      >
        {row.getValue('crmUrl') || 'Нет ссылки'}
      </a>
    ),
    meta: { filterVariant: 'text' },
  },
  { accessorKey: 'login', header: 'Логин', meta: { filterVariant: 'text' } },
  { accessorKey: 'password', header: 'Пароль', meta: { filterVariant: 'text' } },
  { accessorKey: 'coins', header: 'Астрокоины', meta: { filterVariant: 'range' } },
]

export default function GroupStudentsTable({ data }: { data: StudentWithAttendances[] }) {
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
