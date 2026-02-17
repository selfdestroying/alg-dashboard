'use client'
import { Student } from '@/prisma/generated/client'
import DataTable from '@/src/components/data-table'
import { Input } from '@/src/components/ui/input'
import { useTableSearchParams } from '@/src/hooks/use-table-search-params'
import { getFullName } from '@/src/lib/utils'
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import Link from 'next/link'

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
  const { globalFilter, setGlobalFilter, pagination, setPagination, sorting, setSorting } =
    useTableSearchParams({
      search: true,
      pagination: true,
      sorting: true,
    })

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
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    state: {
      globalFilter,
      pagination,
      sorting,
    },
  })

  return (
    <DataTable
      table={table}
      emptyMessage="Нет учеников."
      showPagination
      toolbar={
        <div className="flex flex-col items-end gap-2 md:flex-row">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Поиск..."
          />
        </div>
      }
    />
  )
}
