'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

import { PaymentsWithStudentAndGroup } from '@/actions/payments'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, CircleX, Funnel, Search } from 'lucide-react'
import Link from 'next/link'
import { useId, useMemo, useRef, useState } from 'react'

const getColumns = (): ColumnDef<PaymentsWithStudentAndGroup>[] => [
  {
    header: 'Ученик',
    accessorKey: 'student',
    accessorFn: (item) =>
      item.student ? `${item.student.firstName} ${item.student.lastName}` : 'Удаленный ученик',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="font-medium">
          <Button asChild variant={'link'} size={'sm'} className="h-fit p-0">
            <Link href={`/dashboard/students/${row.original.studentId}`}>
              {row.getValue('student')}
            </Link>
          </Button>
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    header: 'Группа',
    accessorKey: 'group',
    accessorFn: (item) => (item.group ? item.group.name : 'Удаленная группа'),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="font-medium">
          <Button asChild variant={'link'} size={'sm'} className="h-fit p-0">
            <Link href={`/dashboard/groups/${row.original.groupId}`}>{row.getValue('group')}</Link>
          </Button>
        </div>
      </div>
    ),
  },
  {
    header: 'Всего занятий оплачено',
    accessorKey: 'lessonsPaid',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.lessonsPaid}</span>,
  },
  {
    header: 'Осталось занятий',
    accessorKey: 'remainingLessons',
    cell: ({ row }) => {
      const value = row.getValue('remainingLessons') as number
      return (
        <div className="flex items-center gap-2">
          {value <= 0 ? (
            <div
              className="bg-destructive/90 size-1.5 animate-pulse rounded-full"
              aria-hidden="true"
            ></div>
          ) : (
            value <= 3 && (
              <div className="size-1.5 rounded-full bg-amber-500" aria-hidden="true"></div>
            )
          )}
          <span className="text-muted-foreground">{value}</span>
        </div>
      )
    },
  },
]

export default function PaymentsTable({ payments }: { payments: PaymentsWithStudentAndGroup[] }) {
  const id = useId()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'student',
      desc: false,
    },
  ])

  const columns = getColumns()

  const handleDeleteRows = () => {
    table.resetRowSelection()
  }

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  })

  // Extract complex expressions into separate variables
  const statusColumn = table.getColumn('group')
  const statusFacetedValues = statusColumn?.getFacetedUniqueValues()
  const statusFilterValue = statusColumn?.getFilterValue()

  // Update useMemo hooks with simplified dependencies
  const uniqueStatusValues = useMemo(() => {
    if (!statusColumn) return []
    const values = Array.from(statusFacetedValues?.keys() ?? [])
    return values.sort()
  }, [statusColumn, statusFacetedValues])

  const statusCounts = useMemo(() => {
    if (!statusColumn) return new Map()
    return statusFacetedValues ?? new Map()
  }, [statusColumn, statusFacetedValues])

  const selectedStatuses = useMemo(() => {
    return (statusFilterValue as string[]) ?? []
  }, [statusFilterValue])

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn('group')?.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn('group')?.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                'peer min-w-60 bg-gradient-to-br ps-9',
                Boolean(table.getColumn('student')?.getFilterValue()) && 'pe-9'
              )}
              value={(table.getColumn('student')?.getFilterValue() ?? '') as string}
              onChange={(e) => table.getColumn('student')?.setFilterValue(e.target.value)}
              placeholder="Search by name"
              type="text"
              aria-label="Search by name"
            />
            <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
              <Search size={20} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn('student')?.getFilterValue()) && (
              <button
                className="text-muted-foreground/60 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn('student')?.setFilterValue('')
                  if (inputRef.current) {
                    inputRef.current.focus()
                  }
                }}
              >
                <CircleX size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Funnel
                  className="text-muted-foreground/60 -ms-1.5 size-5"
                  size={20}
                  aria-hidden="true"
                />
                Группа
                {selectedStatuses.length > 0 && (
                  <span className="border-border bg-background text-muted-foreground/70 ms-3 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedStatuses.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="end">
              <div className="space-y-3">
                <div className="space-y-3">
                  {uniqueStatusValues.map((value, i) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-${i}`}
                        checked={selectedStatuses.includes(value)}
                        onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                      />
                      <Label
                        htmlFor={`${id}-${i}`}
                        className="flex grow justify-between gap-2 font-normal"
                      >
                        {value}{' '}
                        <span className="text-muted-foreground ms-2 text-xs">
                          {statusCounts.get(value)}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <Table className="table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="bg-sidebar border-border relative h-9 border-y select-none first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            'flex h-full cursor-pointer items-center gap-2 select-none'
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
                          asc: (
                            <ArrowUp className="shrink-0 opacity-60" size={16} aria-hidden="true" />
                          ),
                          desc: (
                            <ArrowDown
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="data-[state=selected]:bg-accent/50 hover:bg-accent/50 h-px border-0 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="h-[inherit] last:py-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="data-[state=selected]:bg-accent/50 hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
      </Table>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground flex-1 text-sm whitespace-nowrap" aria-live="polite">
            Страница{' '}
            <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> из{' '}
            <span className="text-foreground">{table.getPageCount()}</span>
          </p>
          <Pagination className="w-auto">
            <PaginationContent className="gap-3">
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  Назад
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  Далее
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
