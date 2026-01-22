'use client'
import TableFilter from '@/components/table-filter'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getFullName } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Input } from '@/components/ui/input'
import { UserDTO } from '@/types/user'
import { debounce } from 'es-toolkit'
import Link from 'next/link'
import { useMemo, useState } from 'react'

interface UsersTableProps {
  data: UserDTO[]
}

const columns: ColumnDef<UserDTO>[] = [
  {
    id: 'user',
    header: 'Полное имя',
    accessorFn: (value) => value.id,
    cell: ({ row }) => (
      <Link href={`/dashboard/users/${row.original.id}`} className="text-primary hover:underline">
        {getFullName(row.original.firstName, row.original.lastName)}
      </Link>
    ),
  },
  {
    id: 'role',
    header: 'Роль',
    accessorFn: (value) => value.role.id,
    cell: ({ row }) => row.original.role.name,
    filterFn: (row, id, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.role.id)
    },
  },
  {
    header: 'Ставка за урок',
    accessorKey: 'bidForLesson',
  },
  {
    header: 'Ставка за индив',
    accessorKey: 'bidForIndividual',
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: ({ row }) => (
      <span className={row.original.status === 'ACTIVE' ? 'text-success' : 'text-destructive'}>
        {row.original.status === 'ACTIVE' ? 'Активен' : 'Неактивен'}
      </span>
    ),
  },
]

export default function UsersTable({ data }: UsersTableProps) {
  const { roles } = useData()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [search, setSearch] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState('')
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )

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
      const fullName = getFullName(row.original.firstName, row.original.lastName).toLowerCase()
      const roleName = row.original.role.name.toLowerCase()
      return fullName.includes(searchValue) || roleName.includes(searchValue)
    },
    state: {
      columnFilters,
      globalFilter,
    },
  })

  const handleRoleFilterChange = (selectedRoles: { label: string; value: string }[]) => {
    const roleIds = selectedRoles.map((role) => Number(role.value))
    setColumnFilters((old) => {
      const otherFilters = old.filter((filter) => filter.id !== 'role')
      if (roleIds.length === 0) {
        return otherFilters
      }
      return [...otherFilters, { id: 'role', value: roleIds }]
    })
  }

  const mappedRoles = useMemo(
    () =>
      roles.map((role) => ({
        label: role.name,
        value: role.id.toString(),
      })),
    [roles]
  )

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
                Нет пользователей.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
