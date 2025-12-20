'use client'
import { DismissedWithStudentAndGroup } from '@/actions/dismissed'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultipleSelector, { Option } from '@/components/ui/multiselect'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
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
import { cn } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
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
import { toZonedTime } from 'date-fns-tz'
import { debounce } from 'es-toolkit'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import DismissedActions from './dismissed-actions'

const getColumns = (): ColumnDef<DismissedWithStudentAndGroup>[] => [
  {
    header: 'Имя',
    accessorFn: (data) => `${data.student.firstName} ${data.student.lastName}`,
    cell: ({ row }) => (
      <Button asChild variant={'link'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/students/${row.original.student.id}`}>
          {row.original.student.firstName} {row.original.student.lastName}
        </Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Группа',
    accessorFn: (data) => data.group.name,
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/groups/${row.original.groupId}`}>{row.original.group.name}</Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    id: 'teacher',
    header: 'Учитель',
    accessorFn: (data) =>
      data.group.teachers
        .map((teacher) => `${teacher.teacher.firstName} ${teacher.teacher.lastName ?? ''}`)
        .join(', '),
    filterFn: (row, columnId: string, filterValue: string[]) => {
      const rowTeachers = row.original.group.teachers.map((teacher) =>
        teacher.teacher.id.toString()
      )
      return filterValue.length === 0 || rowTeachers.some((id) => filterValue.includes(id))
    },
  },
  {
    id: 'course',
    header: 'Курс',
    accessorFn: (data) => data.group.course.name,
    enableHiding: true,
    filterFn: (row, columnId: string, filterValue: string[]) => {
      const rowCourseId = row.original.group.course.id.toString()
      return filterValue.length === 0 || filterValue.includes(rowCourseId)
    },
  },
  {
    header: 'Комментарий',
    accessorKey: 'comment',
  },
  {
    id: 'date',
    header: 'Дата',
    accessorKey: 'date',
    cell: ({ row }) =>
      toZonedTime(row.original.date, 'Europe/Moscow').toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    filterFn: (row, columnId: string, filterValue: string[]) => {
      const rowDate = new Date(row.getValue(columnId))
      const monthString = (rowDate.getMonth() + 1).toString().padStart(2, '0')
      return filterValue.length === 0 || filterValue.includes(monthString)
    },
  },
]

export default function DismissedTable({
  dismissed,
}: {
  dismissed: DismissedWithStudentAndGroup[]
}) {
  const columns = getColumns()
  const { user } = useData()

  if (user?.role !== 'TEACHER') {
    columns.push({
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DismissedActions
            dismissedId={row.original.id}
            studentName={`${row.original.student.firstName} ${row.original.student.lastName}`}
            studentId={row.original.studentId}
            groupId={row.original.groupId}
          />
        </div>
      ),
      size: 50,
    })
  }

  return (
    <DataTable
      data={dismissed}
      columns={columns}
      paginate
      defaultColumnVisibility={{
        course: false,
      }}
    />
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
  const [search, setSearch] = useState<string>('')
  const [sorting, setSorting] = useState<SortingState>(defaultSorting)
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedMonths, setSelectedMonths] = useState<Option[]>([])
  const [selectedCourses, setSelectedCourses] = useState<Option[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Option[]>([])
  const { courses, users } = useData()

  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )

  useEffect(() => {
    const monthFilters = {
      id: 'date',
      value: selectedMonths.map((month) => month.value),
    }
    const courseFilters = {
      id: 'course',
      value: selectedCourses.map((course) => course.value),
    }
    const userFilters = {
      id: 'teacher',
      value: selectedUsers.map((user) => user.value),
    }

    setColumnFilters([monthFilters, courseFilters, userFilters])
  }, [selectedMonths, selectedCourses, selectedUsers])

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
      <div>
        <div className="grid w-full grid-cols-1 items-end gap-4 md:grid-cols-[1fr_max-auto]">
          <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-[max-content_1fr]">
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
            <div className="flex items-center gap-2">
              <MultipleSelector
                defaultOptions={[
                  '01',
                  '02',
                  '03',
                  '04',
                  '05',
                  '06',
                  '07',
                  '08',
                  '09',
                  '10',
                  '11',
                  '12',
                ]
                  .sort()
                  .map((ym) => ({
                    value: ym,
                    label: new Date(ym + '-01').toLocaleDateString('ru-RU', {
                      month: 'long',
                    }),
                  }))}
                value={selectedMonths}
                placeholder="Выберите месяц"
                emptyIndicator={<p className="text-center text-sm">Нет подходящих месяцев</p>}
                hidePlaceholderWhenSelected
                onChange={setSelectedMonths}
              />
              <MultipleSelector
                defaultOptions={courses.map((course) => ({
                  label: course.name,
                  value: course.id.toString(),
                }))}
                value={selectedCourses}
                placeholder="Выберите курс"
                emptyIndicator={<p className="text-center text-sm">Нет подходящих курсов</p>}
                hidePlaceholderWhenSelected
                onChange={setSelectedCourses}
              />
              <MultipleSelector
                defaultOptions={users.map((user) => ({
                  label: `${user.firstName} ${user.lastName ?? ''}`,
                  value: user.id.toString(),
                }))}
                value={selectedUsers}
                placeholder="Выберите пользователя"
                emptyIndicator={<p className="text-center text-sm">Нет подходящих пользователей</p>}
                hidePlaceholderWhenSelected
                onChange={setSelectedUsers}
              />
            </div>
          </div>
        </div>
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-accent/50 h-px border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="truncate last:py-0"
                    title={cell.getValue<string>()}
                  >
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
