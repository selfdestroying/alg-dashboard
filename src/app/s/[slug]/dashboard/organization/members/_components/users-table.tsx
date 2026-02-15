'use client'
import DataTable from '@/src/components/data-table'
import TableFilter from '@/src/components/table-filter'
import {
  ColumnDef,
  ColumnFiltersState,
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
      const fullName = row.original.user.name.toLowerCase()
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
    <DataTable
      table={table}
      emptyMessage="Нет пользователей."
      toolbar={
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
      }
    />
  )
}
