'use client'
import { AttendanceWithStudents } from '@/actions/attendance'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import { cn, getFullName, getGroupName } from '@/lib/utils'
import {
  ColumnDef,
  ColumnFilter,
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
import { startOfDay } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import { debounce } from 'es-toolkit'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'

const columns: ColumnDef<AttendanceWithStudents>[] = [
  {
    header: 'Имя',
    accessorFn: (value) => value.studentId,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/students/${row.original.studentId}`}
        className="text-primary hover:underline"
      >
        {getFullName(row.original.student.firstName, row.original.student.lastName)}
      </Link>
    ),
  },
  {
    header: 'Группа',
    accessorFn: (value) => value.lesson.group.id,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/groups/${row.original.lesson.group.id}`}
        className="text-primary hover:underline"
      >
        {getGroupName(row.original.lesson.group)}
      </Link>
    ),
  },
  {
    id: 'date',
    header: 'Дата пропуска',
    accessorKey: 'lesson.date',
    cell: ({ row }) =>
      toZonedTime(new Date(row.original.lesson.date), 'Europe/Moscow').toLocaleDateString('ru-RU'),
    filterFn: (row, columnId, filterValue) => {
      const lessonDate = startOfDay(new Date(row.getValue<Date>(columnId)))
      const fromDate = startOfDay(new Date(filterValue.from))
      const toDate = startOfDay(new Date(filterValue.to))
      return lessonDate >= fromDate && lessonDate <= toDate
    },
  },
]

export default function StudentsTable({ data }: { data: AttendanceWithStudents[] }) {
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
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const fullName = getFullName(
        row.original.student.firstName,
        row.original.student.lastName
      ).toLowerCase()
      return fullName.includes(searchValue)
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,

    state: {
      globalFilter,
      pagination,
      sorting,
      columnFilters,
    },
  })

  const handleDateRangeChangeFilter = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const fromDate = fromZonedTime(range.from, 'Europe/Moscow')
      const toDate = fromZonedTime(range.to, 'Europe/Moscow')

      console.log({ fromDate, toDate })

      setColumnFilters((prev) => {
        const filtered = prev.filter((filter) => filter.id !== 'date')
        return [
          ...filtered,
          {
            id: 'date',
            value: { from: fromDate, to: toDate },
          },
        ]
      })
    } else {
      setColumnFilters((prev) => prev.filter((filter) => filter.id !== 'date'))
    }
    setRange(range)
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
        <Popover>
          <PopoverTrigger
            render={
              <Button id="date" variant="outline" className="w-fit">
                {range?.from && range?.to
                  ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                  : 'Выбрать дату'}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleDateRangeChangeFilter}
              locale={ru}
              components={{
                DayButton: (props) => (
                  <CalendarDayButton
                    {...props}
                    data-day={props.day.date.toLocaleDateString('ru-RU')}
                  />
                ),
              }}
            />
          </PopoverContent>
        </Popover>
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
                Нет учеников.
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
