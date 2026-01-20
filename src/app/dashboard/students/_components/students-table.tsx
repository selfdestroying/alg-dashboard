'use client'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getFullName } from '@/lib/utils'
import { Student } from '@prisma/client'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { debounce } from 'es-toolkit'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const columns: ColumnDef<Student>[] = [
  {
    header: 'Имя',
    accessorFn: (value) => value.id,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/students/${row.original.id}`}
        className="text-primary hover:underline"
      >
        {getFullName(row.original.firstName, row.original.lastName)}
      </Link>
    ),
  },
  {
    header: 'Возраст',
    accessorKey: 'age',
  },
  {
    header: 'Всего оплат',
    accessorKey: 'totalPayments',
  },
  {
    header: 'Всего уроков',
    accessorKey: 'totalLessons',
  },
  {
    header: 'Баланс уроков',
    accessorKey: 'lessonsBalance',
    cell: ({ row }) => (
      <span className={row.original.lessonsBalance < 2 ? 'text-destructive' : undefined}>
        {row.original.lessonsBalance}
      </span>
    ),
  },
  {
    header: 'Имя родителя',
    accessorKey: 'parentsName',
  },
  {
    header: 'Логин',
    accessorKey: 'login',
  },
  {
    header: 'Пароль',
    accessorKey: 'password',
  },
  {
    header: 'Коины',
    accessorKey: 'coins',
  },
]

export default function StudentsTable({ data }: { data: Student[] }) {
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )
  const [search, setSearch] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState('')
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const fullName = getFullName(row.original.firstName, row.original.lastName).toLowerCase()
      return fullName.includes(searchValue)
    },
    state: {
      globalFilter,
    },
  })

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-col items-end gap-2 md:flex-row">
        <Input
          value={search ?? ''}
          onChange={(e) => {
            setSearch(e.target.value)
            handleSearch(e.target.value)
          }}
          placeholder="Поиск..."
        />
      </div>
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
