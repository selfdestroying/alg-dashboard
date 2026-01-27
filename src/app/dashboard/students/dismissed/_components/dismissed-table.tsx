'use client'
import { DismissedWithStudentAndGroup } from '@/actions/dismissed'
import TableFilter, { TableFilterItem } from '@/components/table-filter'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, getFullName } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { toZonedTime } from 'date-fns-tz'
import { debounce } from 'es-toolkit'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import DismissedActions from './dismissed-actions'

const columns: ColumnDef<DismissedWithStudentAndGroup>[] = [
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
        {row.original.group.name}
      </Link>
    ),
    filterFn: (row, id, filterValue) => {
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
    header: 'Комментарий',
    cell: ({ row }) => (
      <p className="max-w-52 truncate" title={row.original.comment || ''}>
        {row.original.comment || '-'}
      </p>
    ),
  },
  {
    id: 'location',
    header: 'Локация',
    cell: ({ row }) => row.original.group.location?.name,
    filterFn: (row, id, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.group.location?.id)
    },
  },
  {
    header: 'Дата отчисления',
    accessorKey: 'date',
    cell: ({ row }) =>
      toZonedTime(new Date(row.original.date), 'Europe/Moscow').toLocaleDateString('ru-RU'),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DismissedActions
        dismissedId={row.original.id}
        groupId={row.original.groupId}
        studentId={row.original.studentId}
        studentName={getFullName(row.original.student.firstName, row.original.student.lastName)}
      />
    ),
  },
]

export default function DismissedStudentsTable({ data }: { data: DismissedWithStudentAndGroup[] }) {
  const { courses, locations, users } = useData()
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [search, setSearch] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
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
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,

    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
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
    <div className="flex h-full flex-col gap-2">
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
    </div>
  )
}
