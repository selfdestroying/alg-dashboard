'use client'
import { OrderWithProductAndStudent } from '@/actions/orders'
import TableFilter, { TableFilterItem } from '@/components/table-filter'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, getFullName } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { cva } from 'class-variance-authority'
import { toZonedTime } from 'date-fns-tz'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import OrderActions from './order-actions'

export const OrderStatusMap: { [key in OrderStatus]: string } = {
  CANCELLED: 'Отменен',
  COMPLETED: 'Выполнен',
  PENDING: 'В ожидании',
}

const statusVariants = cva('', {
  variants: {
    status: {
      PENDING: 'text-warning',
      COMPLETED: 'text-success',
      CANCELLED: 'text-destructive',
    },
  },
})

const columns: ColumnDef<OrderWithProductAndStudent>[] = [
  {
    header: 'Товар',
    accessorFn: (item) => item.product.name,
  },
  {
    header: 'Ученик',
    cell: ({ row }) => (
      <Link
        href={`/dashboard/students/${row.original.student.id}`}
        className="text-primary hover:underline"
      >
        {getFullName(row.original.student.firstName, row.original.student.lastName)}
      </Link>
    ),
  },
  {
    header: 'Цена',
    accessorFn: (item) => item.product.price,
  },
  {
    id: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.original.status
      return <span className={statusVariants({ status })}>{OrderStatusMap[status]}</span>
    },
    filterFn: (row, id, filterValue) => {
      const status = row.original.status
      const selectedStatuses = (filterValue as string[]).map((value) => value.toLowerCase())
      return selectedStatuses.length === 0 || selectedStatuses.includes(status.toLowerCase())
    },
  },
  {
    header: 'Дата',
    accessorFn: (item) => toZonedTime(item.createdAt, 'Europe/Moscow').toLocaleString('ru-RU'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <OrderActions order={row.original} />,
  },
]

const filterOptions: TableFilterItem[] = [
  { label: 'Выполнен', value: 'COMPLETED' },
  { label: 'В ожидании', value: 'PENDING' },
  { label: 'Отменен', value: 'CANCELLED' },
]

export default function OrdersTable({ data }: { data: OrderWithProductAndStudent[] }) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [filterValues, setFilterValues] = useState<TableFilterItem[]>([filterOptions[1]])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: 'status', value: ['PENDING'] },
  ])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination,
      sorting,
      columnFilters,
    },
  })

  const handleStatusFilterChange = (selectedStatuses: TableFilterItem[]) => {
    setFilterValues(selectedStatuses)
    console.log('Selected Statuses:', selectedStatuses)
    const selectedValues = selectedStatuses.map((status) => status.value)
    setColumnFilters((prev) => {
      const otherFilters = prev.filter((filter) => filter.id !== 'status')
      if (selectedValues.length === 0) {
        return otherFilters
      }
      return [...otherFilters, { id: 'status', value: selectedValues }]
    })
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-col items-end gap-2 md:flex-row">
        <TableFilter
          label="Статус"
          items={filterOptions}
          value={filterValues}
          onChange={handleStatusFilterChange}
        />
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
                Нет заказов.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end px-4">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page">Строк на страницу:</Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Label className="flex w-fit items-center justify-center">
              Страница {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
            </Label>
            <Button
              variant="outline"
              className="hidden lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">На первую страницу</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">На предыдущую страницу</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">На следующую страницу</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">На последнюю страницу</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
