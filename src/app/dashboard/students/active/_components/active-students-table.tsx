'use client'
import TableFilter, { TableFilterItem } from '@/components/table-filter'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
import { cn, getFullName, getGroupName } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
import { Prisma } from '@prisma/client'
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

const columns: ColumnDef<ActiveStudent>[] = [
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
    id: 'course',
    header: 'Группа',
    accessorFn: (value) => value.groupId,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/groups/${row.original.groupId}`}
        className="text-primary hover:underline"
      >
        {getGroupName(row.original.group)}
      </Link>
    ),
    filterFn: (row, columnId, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.group.course.id)
    },
  },
  {
    id: 'teacher',
    header: 'Учителя',
    cell: ({ row }) => (
      <div className="flex gap-x-1">
        {row.original.group.teachers.length === 0 ? (
          <span>-</span>
        ) : (
          row.original.group.teachers.map((t, index) => (
            <span key={t.teacher.id}>
              <Link
                href={`/dashboard/users/${t.teacher.id}`}
                className="text-primary hover:underline"
              >
                {getFullName(t.teacher.firstName, t.teacher.lastName)}
              </Link>
              {index < row.original.group.teachers.length - 1 && ', '}
            </span>
          ))
        )}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const teacherIds = row.original.group.teachers.map((t) => t.teacher.id)
      return (
        filterValue.length === 0 || teacherIds.some((teacherId) => filterValue.includes(teacherId))
      )
    },
  },
  {
    id: 'location',
    header: 'Локация',
    accessorFn: (value) => value.group.location?.id,
    cell: ({ row }) => row.original.group.location?.name,
    filterFn: (row, columnId, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.group.location?.id)
    },
  },
  {
    header: 'Всего оплат',
    accessorKey: 'student.totalPayments',
  },
  {
    header: 'Всего уроков',
    accessorKey: 'student.totalLessons',
  },
  {
    header: 'Баланс уроков',
    accessorKey: 'student.lessonsBalance',
    cell: ({ row }) => (
      <span className={row.original.student.lessonsBalance < 2 ? 'text-destructive' : undefined}>
        {row.original.student.lessonsBalance}
      </span>
    ),
  },
]

export default function ActiveStudentsTable({ data }: { data: ActiveStudent[] }) {
  const { courses, locations, users } = useData()
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
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
      const fullName = getFullName(
        row.original.student.firstName,
        row.original.student.lastName
      ).toLowerCase()
      return fullName.includes(searchValue)
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    state: {
      columnFilters,
      globalFilter,
      pagination,
      sorting,
    },
  })

  const handleCourseFilterChange = (selectedCourses: TableFilterItem[]) => {
    const courseIds = selectedCourses.map((course) => Number(course.value))
    setColumnFilters((old) => {
      const otherFilters = old.filter((filter) => filter.id !== 'course')

      return [
        ...otherFilters,
        {
          id: 'course',
          value: courseIds,
        },
      ]
    })
  }

  const handleLocationFilterChange = (selectedLocations: TableFilterItem[]) => {
    const locationIds = selectedLocations.map((location) => Number(location.value))
    setColumnFilters((old) => {
      const otherFilters = old.filter((filter) => filter.id !== 'location')

      return [
        ...otherFilters,
        {
          id: 'location',
          value: locationIds,
        },
      ]
    })
  }

  const handleUserFilterChange = (selectedUsers: TableFilterItem[]) => {
    const userIds = selectedUsers.map((user) => Number(user.value))
    setColumnFilters((old) => {
      const otherFilters = old.filter((filter) => filter.id !== 'teacher')

      return [
        ...otherFilters,
        {
          id: 'teacher',
          value: userIds,
        },
      ]
    })
  }

  const mappedCourses = useMemo(
    () => courses.map((course) => ({ label: course.name, value: course.id.toString() })),
    [courses]
  )
  const mappedLocations = useMemo(
    () => locations.map((location) => ({ label: location.name, value: location.id.toString() })),
    [locations]
  )
  const mappedUsers = useMemo(
    () =>
      users.map((user) => ({
        label: getFullName(user.firstName, user.lastName),
        value: user.id.toString(),
      })),
    [users]
  )

  return (
    <div className="flex flex-col gap-2">
      <FieldGroup className="flex flex-col items-end gap-2 md:flex-row">
        <Input
          value={search ?? ''}
          onChange={(e) => {
            setSearch(e.target.value)
            handleSearch(e.target.value)
          }}
          placeholder="Поиск..."
        />
        <TableFilter label="Курс" items={mappedCourses} onChange={handleCourseFilterChange} />
        <TableFilter
          label="Локация"
          items={mappedLocations}
          onChange={handleLocationFilterChange}
        />
        <TableFilter label="Преподаватель" items={mappedUsers} onChange={handleUserFilterChange} />
      </FieldGroup>
      <Table>
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
                Нет активных учеников.
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
