'use client'

import { Location } from '@/prisma/generated/client'
import DataTable from '@/src/components/data-table'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useTableSearchParams } from '@/src/hooks/use-table-search-params'
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
import { useMemo } from 'react'
import { useLocationListQuery } from '../queries'
import LocationActions from './location-actions'

export default function LocationsTable() {
  const { data: locations = [], isLoading, isError } = useLocationListQuery()

  const columns: ColumnDef<Location>[] = useMemo(
    () => [
      {
        header: 'Название',
        accessorKey: 'name',
        meta: {
          filterVariant: 'text',
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <LocationActions location={row.original} />,
      },
    ],
    [],
  )

  const { globalFilter, setGlobalFilter, pagination, setPagination, sorting, setSorting } =
    useTableSearchParams({
      search: true,
      pagination: true,
      sorting: true,
    })

  const table = useReactTable({
    data: locations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const name = row.original.name.toLowerCase()
      return name.includes(searchValue)
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-destructive">Ошибка при загрузке локаций.</div>
  }

  return (
    <DataTable
      table={table}
      emptyMessage="Нет локаций."
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
