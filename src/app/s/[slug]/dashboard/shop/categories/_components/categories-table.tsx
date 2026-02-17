'use client'
import { Category } from '@/prisma/generated/client'
import DataTable from '@/src/components/data-table'
import { Input } from '@/src/components/ui/input'
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
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Поиск..."
          />
        </div>
      }
    />
  )
}
