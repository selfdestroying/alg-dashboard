'use client'
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
import { Prisma } from '@prisma/client'
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  TableOptions,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { debounce } from 'es-toolkit'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type ActiveStudent = Prisma.StudentGroupGetPayload<{
  include: {
    group: {
      include: {
        location: true
        course: true
        teachers: {
          include: {
            teacher: true
          }
        }
      }
    }
    student: {
      include: {
        payments: true
      }
    }
  }
}>

const getColumns = (): ColumnDef<ActiveStudent>[] => [
  {
    header: 'Полное имя',
    accessorKey: 'fullName',
    accessorFn: (value) => `${value.student.firstName} ${value.student.lastName}`,
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'}>
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
    header: 'ФИО Родителя',
    accessorKey: 'parentsName',
    accessorFn: (value) => value.student.parentsName || 'Не указано',
  },
  {
    header: 'Ссылка в amoCRM',
    accessorKey: 'crmUrl',
    accessorFn: (value) => value.student.crmUrl,
    cell: ({ row }) => (
      <Button asChild variant={'link'} className="h-fit w-fit p-0 font-medium">
        <a target="_blank" href={row.getValue('crmUrl') || '#'} rel="noopener noreferrer">
          {row.getValue('crmUrl') ? 'Ссылка' : 'Нет ссылки'}
        </a>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Группа',
    accessorKey: 'group',
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/groups/${row.original.group.id}`}>{row.original.group.name}</Link>
      </Button>
    ),
  },
  {
    header: 'Учителя',
    accessorKey: 'teachers',
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
    header: 'Курс',
    accessorKey: 'course',
    accessorFn: (value) => value.group.course.name,
    filterFn: (row, columnId: string, filterValue: string[]) => {
      const rowCourseId = row.original.group.course.id.toString()
      return filterValue.length === 0 || filterValue.includes(rowCourseId)
    },
  },
  {
    header: 'Локация',
    accessorKey: 'location',
    accessorFn: (value) => value.group.location?.name || 'Не указана',
    filterFn: (row, columnId: string, filterValue: string[]) => {
      const rowLocationId = row.original.group.location?.id.toString()
      return filterValue.length === 0 || filterValue.includes(rowLocationId || '')
    },
  },
  {
    header: 'Баланс уроков',
    accessorKey: 'lessonsBalance',
    accessorFn: (value) => value.student.lessonsBalance,
  },
  {
    header: 'Оплачено уроков',
    accessorKey: 'totalLessons',
    accessorFn: (value) => value.student.totalLessons,
  },
  {
    header: 'Сумма оплат',
    accessorKey: 'totalPayments',
    accessorFn: (value) => value.student.totalPayments,
  },
]

export function ActiveStudentsTable({ data }: { data: ActiveStudent[] }) {
  const columns = getColumns()
  return <DataTable data={data} columns={columns} paginate />
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

export default function DataTable<T extends DataObject>({
  data,
  columns,
  paginate,
  tableOptions,
}: DataTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    course: false,
    teachers: false,
    parentsName: false,
  })
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [search, setSearch] = useState<string>('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<Option[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Option[]>([])
  const [selectedLocations, setSelectedLocations] = useState<Option[]>([])
  const { courses, users, locations } = useData()

  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )

  useEffect(() => {
    const courseFilters = {
      id: 'course',
      value: selectedCourses.map((course) => course.value),
    }
    const userFilters = {
      id: 'teachers',
      value: selectedUsers.map((user) => user.value),
    }
    const locationFilters = {
      id: 'location',
      value: selectedLocations.map((location) => location.value),
    }

    setColumnFilters([courseFilters, userFilters, locationFilters])
  }, [selectedCourses, selectedUsers, selectedLocations])

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
    <div className="w-full space-y-2">
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
            <MultipleSelector
              defaultOptions={locations.map((location) => ({
                label: location.name,
                value: location.id.toString(),
              }))}
              value={selectedLocations}
              placeholder="Выберите локацию"
              emptyIndicator={<p className="text-center text-sm">Нет подходящих локаций</p>}
              hidePlaceholderWhenSelected
              onChange={setSelectedLocations}
            />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'flex cursor-pointer items-center gap-2 select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            // Enhanced keyboard handling for sorting
                            if (
                              header.column.getCanSort() &&
                              (e.key === 'Enter' || e.key === ' ')
                            ) {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: (
                              <ArrowUp
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="overflow-hidden">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
