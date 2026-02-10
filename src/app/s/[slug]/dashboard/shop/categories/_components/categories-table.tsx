'use client'
import { Category } from '@/prisma/generated/client'
import DataTable from '@/src/components/data-table'
import { Input } from '@/src/components/ui/input'
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { debounce } from 'es-toolkit'
import { useMemo, useState } from 'react'
import CategoryActions from './category-actions'

const columns: ColumnDef<Category>[] = [
  {
    header: 'Название',
    accessorKey: 'name',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Описание',
    accessorKey: 'description',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CategoryActions category={row.original} />,
  },
]

export default function CategoriesTable({ data }: { data: Category[] }) {
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )
  const [search, setSearch] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const fullName = row.original.name.toLowerCase()
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
      emptyMessage="Нет категорий."
      showPagination
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
        </div>
      }
    />
  )
}
