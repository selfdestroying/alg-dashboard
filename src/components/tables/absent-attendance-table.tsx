'use client'
import { AttendanceWithStudents, updateAttendanceComment } from '@/actions/attendance'
import AttendanceActions from '@/components/attendance-actions'
import { AttendanceStatusSwitcher } from '@/components/attendance-status-switcher'
import { DateRangePicker } from '@/components/date-range-picker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
import { AttendanceStatus, StudentStatus } from '@prisma/client'
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
  PaginationState,
  SortingState,
  TableOptions,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { endOfDay, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import { debounce, DebouncedFunction } from 'es-toolkit'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Pagination, PaginationContent, PaginationItem } from '../ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

const StudentStatusMap: { [key in StudentStatus]: string } = {
  ACTIVE: 'Ученик',
  DISMISSED: 'Отчислен',
  TRIAL: 'Пробный',
}

const AttendanceStatusVariantMap: { [key in AttendanceStatus]: 'success' | 'error' | 'outline' } = {
  PRESENT: 'success',
  ABSENT: 'error',
  UNSPECIFIED: 'outline',
}

function useSkipper() {
  const shouldSkipRef = React.useRef(true)
  const shouldSkip = shouldSkipRef.current

  const skip = React.useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  React.useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}

const getColumns = (
  handleUpdate: DebouncedFunction<
    (studentId: number, lessonId: number, comment?: string, status?: AttendanceStatus) => void
  >
): ColumnDef<AttendanceWithStudents>[] => {
  const columns: ColumnDef<AttendanceWithStudents>[] = [
    {
      header: 'Дата пропуска',
      accessorKey: 'date',
      accessorFn: (value) => value.lesson?.date ?? null,
      cell: ({ row }) => {
        const date = row.original.lesson?.date as Date | undefined
        return date
          ? toZonedTime(date, 'Europe/Moscow').toLocaleDateString('ru', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
            })
          : '—'
      },
    },
    {
      header: 'Полное имя',
      accessorKey: 'fullName',
      accessorFn: (value) => `${value.student.firstName} ${value.student.lastName}`,
      cell: ({ row }) => (
        <Button asChild variant={'link'} className="h-fit p-0 font-medium">
          <Link href={`/dashboard/students/${row.original.studentId}`}>
            {row.original.student.firstName} {row.original.student.lastName}
          </Link>
        </Button>
      ),
    },
    {
      header: 'Группа',
      accessorKey: 'group',
      accessorFn: (value) => value.lesson.group.name,
      cell: ({ row }) => (
        <Button asChild variant={'link'} className="h-fit p-0 font-medium">
          <Link href={`/dashboard/groups/${row.original.lesson.groupId}`}>
            {row.original.lesson.group.name}
          </Link>
        </Button>
      ),
    },
    {
      header: 'Статус ученика',
      accessorKey: 'studentStatus',
      cell: ({ row }) => (
        <Badge variant={row.original.studentStatus === 'ACTIVE' ? 'success' : 'info'}>
          {StudentStatusMap[row.original.studentStatus]}
        </Badge>
      ),
    },
    {
      header: 'Статус',
      accessorKey: 'status',
      cell: ({ row }) => (
        <AttendanceStatusSwitcher
          lessonId={row.original.lessonId}
          studentId={row.original.studentId}
          status={row.original.status}
        />
      ),
    },
    {
      header: 'Отработка',
      cell: ({ row }) =>
        row.original.asMakeupFor ? (
          <Badge asChild variant={'info'}>
            <Link href={`/dashboard/lessons/${row.original.asMakeupFor.missedAttendance.lessonId}`}>
              Отработка за{' '}
              {toZonedTime(
                row.original.asMakeupFor.missedAttendance.lesson!.date,
                'Europe/Moscow'
              ).toLocaleDateString('ru', {
                month: '2-digit',
                day: '2-digit',
              })}
              <ExternalLink />
            </Link>
          </Badge>
        ) : row.original.missedMakeup ? (
          <Badge
            asChild
            variant={AttendanceStatusVariantMap[row.original.missedMakeup.makeUpAttendance.status]}
          >
            <Link
              href={`/dashboard/lessons/${row.original.missedMakeup.makeUpAttendance.lessonId}`}
            >
              Отработка{' '}
              {toZonedTime(
                row.original.missedMakeup.makeUpAttendance.lesson!.date,
                'Europe/Moscow'
              ).toLocaleDateString('ru', {
                month: '2-digit',
                day: '2-digit',
              })}
              <ExternalLink />
            </Link>
          </Badge>
        ) : null,
    },
    {
      header: 'Комментарий',
      accessorKey: 'comment',
      cell: ({ row }) => (
        <Input
          className="h-8"
          defaultValue={row.original.comment}
          onChange={(e) =>
            handleUpdate(row.original.studentId, row.original.lessonId, e.target.value)
          }
        />
      ),
    },
  ]
  return columns
}

export function AbsentAttendanceTable({ attendance }: { attendance: AttendanceWithStudents[] }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  const { user } = useData()
  const handleUpdate = useMemo(
    () =>
      debounce((studentId: number, lessonId: number, comment?: string) => {
        skipAutoResetPageIndex()
        const ok = updateAttendanceComment({
          where: {
            studentId_lessonId: {
              studentId: studentId,
              lessonId: lessonId,
            },
          },
          data: {
            comment,
          },
        })
        toast.promise(ok, {
          loading: 'Загрузка...',
          success: 'Успешно!',
          error: (e) => e.message,
        })
      }, 500),
    [skipAutoResetPageIndex]
  )

  const filteredAttendance = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return attendance

    const from = dateRange?.from ? startOfDay(dateRange.from) : undefined
    const to = dateRange?.to ? endOfDay(dateRange.to) : undefined

    return attendance.filter((item) => {
      const date = item.lesson?.date ? new Date(item.lesson.date) : null
      if (!date || Number.isNaN(date.getTime())) return false
      if (from && date < from) return false
      if (to && date > to) return false
      return true
    })
  }, [attendance, dateRange])

  const columns = getColumns(handleUpdate)
  if (user?.role !== 'TEACHER') {
    columns.push({
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <AttendanceActions attendance={row.original} />
        </div>
      ),
      size: 50,
    })
  }

  const today = new Date()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          calendarProps={{
            numberOfMonths: 2,
            disabled: { after: today, before: new Date(2025, 8, 1) },
            locale: ru,
          }}
        />
        {dateRange?.from || dateRange?.to ? (
          <Button variant={'outline'} size={'sm'} onClick={() => setDateRange(undefined)}>
            Сбросить
          </Button>
        ) : null}
      </div>

      <DataTable
        paginate={true}
        data={filteredAttendance}
        columns={columns}
        tableOptions={{
          autoResetPageIndex,
        }}
      />
    </div>
  )
}

interface DataObject {
  [key: string]: Exclude<unknown, undefined>
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  defaultFilters?: ColumnFiltersState
  defaultSorting?: SortingState
  defaultColumnVisibility?: VisibilityState
  defaultPagination?: PaginationState
  paginate: boolean
  tableOptions?: Partial<TableOptions<T>>
}

function DataTable<T extends DataObject>({
  data,
  columns,
  defaultFilters = [],
  defaultSorting = [],
  defaultColumnVisibility = {},
  defaultPagination = {
    pageIndex: 0,
    pageSize: 10,
  },
  paginate,
  tableOptions,
}: DataTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility)
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>(defaultSorting)
  const [search, setSearch] = useState<string>('')
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: paginate ? getPaginationRowModel() : undefined,
    onPaginationChange: paginate ? setPagination : undefined,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    state: {
      sorting,
      pagination: paginate ? pagination : undefined,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    ...tableOptions,
  })

  return (
    <div className="space-y-2">
      <div className="w-fit">
        <Input
          value={search ?? ''}
          onChange={(e) => {
            setSearch(e.target.value)
            handleSearch(e.target.value)
          }}
          className="font-lg border-block border p-2 shadow"
          placeholder="Общий поиск..."
        />
      </div>
      <Table className="table-fixed border-separate border-spacing-0 rounded-lg border [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="bg-sidebar relative rounded-t-lg border-b"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            'flex cursor-pointer items-center gap-2 select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-accent/50 h-px border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="last:py-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {table.getRowModel().rows.length > 0 && paginate && (
        <>
          <div className="flex items-center justify-between gap-2">
            <p
              className="text-muted-foreground flex-1 text-sm whitespace-nowrap"
              aria-live="polite"
            >
              Страница{' '}
              <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span>{' '}
              из <span className="text-foreground">{table.getPageCount()}</span>
            </p>
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Строк на страницу:
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Pagination className="w-auto">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <Button
                    variant="outline"
                    size={'icon-sm'}
                    className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to previous page"
                  >
                    <ArrowLeft />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size={'icon-sm'}
                    className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to next page"
                  >
                    <ArrowRight />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  )
}
