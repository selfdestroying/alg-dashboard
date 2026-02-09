'use client'
import TableFilter from '@/src/components/table-filter'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { cn, getFullName } from '@/src/lib/utils'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'

import { Prisma } from '@/prisma/generated/client'
import { memberRoleLabels } from '@/src/components/sidebar/nav-user'
import { Input } from '@/src/components/ui/input'
import { OrganizationRole } from '@/src/lib/auth'
import { debounce } from 'es-toolkit'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import UsersActions from './users-actions'

interface UsersTableProps {
  data: Prisma.MemberGetPayload<{ include: { user: true } }>[]
}

const columns: ColumnDef<Prisma.MemberGetPayload<{ include: { user: true } }>>[] = [
  {
    id: 'user',
    header: 'Полное имя',
    accessorFn: (value) => value.id,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/organization/members/${row.original.id}`}
        className="text-primary hover:underline"
      >
        {row.original.user.name}
      </Link>
    ),
  },
  {
    id: 'role',
    header: 'Роль',
    accessorFn: (value) => value.role,
    cell: ({ row }) => memberRoleLabels[row.original.role as OrganizationRole],
    filterFn: (row, id, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.role)
    },
  },
  {
    header: 'Ставка за урок',
    cell: ({ row }) => row.original.user.bidForLesson,
  },
  {
    header: 'Ставка за индив',
    cell: ({ row }) => row.original.user.bidForIndividual,
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: ({ row }) => (
      <span className={row.original.user.banned ? 'text-destructive' : 'text-success'}>
        {row.original.user.banned ? 'Неактивен' : 'Активен'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <UsersActions member={row.original} />,
  },
]

const mappedRoles = [
  { label: 'Учитель', value: 'teacher' },
  { label: 'Менеджер', value: 'manager' },
]

export default function UsersTable({ data }: UsersTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [search, setSearch] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState('')
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const fullName = getFullName(
        row.original.user.firstName,
        row.original.user.lastName
      ).toLowerCase()
      const roleName = row.original.role ? row.original.role.toLowerCase() : ''
      return fullName.includes(searchValue) || roleName.includes(searchValue)
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
  })

  const handleRoleFilterChange = (selectedRoles: { label: string; value: string }[]) => {
    const roleIds = selectedRoles.map((role) => role.value)
    setColumnFilters((old) => {
      const otherFilters = old.filter((filter) => filter.id !== 'role')
      if (roleIds.length === 0) {
        return otherFilters
      }
      return [...otherFilters, { id: 'role', value: roleIds }]
    })
  }

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
        <TableFilter items={mappedRoles} label="Роль" onChange={handleRoleFilterChange} />
      </div>
      <Table className="overflow-y-auto">
        <TableHeader className="bg-card sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <div
                      className={cn(
                        header.column.getCanSort() &&
                          'flex w-fit cursor-pointer items-center gap-2 select-none'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        // Enhanced keyboard handling for sorting
                        if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          header.column.getToggleSortingHandler()?.(e)
                        }
                      }}
                      tabIndex={header.column.getCanSort() ? 0 : undefined}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ArrowUp className="shrink-0 opacity-60" size={16} />,
                        desc: <ArrowDown className="shrink-0 opacity-60" size={16} />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
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
                Нет пользователей.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
