'use client'

import { getGroups } from '@/actions/groups'
import TableFilter, { TableFilterItem } from '@/components/table-filter'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DaysOfWeek, getFullName } from '@/lib/utils'
import { useData } from '@/providers/data-provider'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { debounce } from 'es-toolkit'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const columns: ColumnDef<Awaited<ReturnType<typeof getGroups>>[number]>[] = [
  {
    header: 'Группа',
    accessorFn: (value) => value.id,
    cell: ({ row }) => (
      <Link href={`/dashboard/groups/${row.original.id}`} className="text-primary hover:underline">
        Ссылка
      </Link>
    ),
  },
  {
    header: 'День',
    accessorFn: (value) => (value.dayOfWeek ? DaysOfWeek.full[value.dayOfWeek] : '—'),
  },
  {
    header: 'Время',
    accessorKey: 'time',
  },
  {
    id: 'course',
    header: 'Курс',
    accessorFn: (value) => value.courseId,
    cell: ({ row }) => row.original.course.name,
    filterFn: (row, id, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.course.id)
    },
  },
  {
    id: 'teacher',
    header: 'Учителя',
    cell: ({ row }) => (
      <div className="flex gap-x-1">
        {row.original.teachers.length === 0 ? (
          <span>-</span>
        ) : (
          row.original.teachers.map((t, index) => (
            <span key={t.teacher.id}>
              <Link
                href={`/dashboard/users/${t.teacher.id}`}
                className="text-primary hover:underline"
              >
                {getFullName(t.teacher.firstName, t.teacher.lastName)}
              </Link>
              {index < row.original.teachers.length - 1 && ', '}
            </span>
          ))
        )}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const teacherIds = row.original.teachers.map((t) => t.teacher.id)
      return (
        filterValue.length === 0 || teacherIds.some((teacherId) => filterValue.includes(teacherId))
      )
    },
  },
  {
    id: 'studentCount',
    header: 'Учеников',
    accessorFn: (value) => value._count.students,
    filterFn: (row, columnId, filterValue) => {
      const [min, max] = filterValue || []
      const value = row.getValue(columnId) as number
      if (min !== undefined && value < min) return false
      if (max !== undefined && value > max) return false
      return true
    },
  },
  {
    id: 'location',
    header: 'Локация',
    accessorFn: (value) => value.location?.id,
    cell: ({ row }) => row.original.location?.name,
    filterFn: (row, columnId, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.location?.id)
    },
  },
  {
    header: 'Тип',
    accessorFn: (value) => (value.type === 'GROUP' ? 'Группа' : 'Индивидуальное занятие'),
  },
  {
    header: 'Ссылка в БО',
    accessorKey: 'backOfficeUrl',
    cell: ({ row }) => (
      <a
        href={row.original.backOfficeUrl || ''}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary truncate hover:underline"
      >
        Ссылка
      </a>
    ),
  },
]

export default function GroupsTable({ data }: { data: Awaited<ReturnType<typeof getGroups>> }) {
  const { courses, locations, users } = useData()
  const handleSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(String(value)), 300),
    []
  )
  const handleStudentCountFilterChange = useMemo(
    () =>
      debounce((value: [number | undefined, number | undefined]) => {
        setColumnFilters((old) => {
          const otherFilters = old.filter((filter) => filter.id !== 'studentCount')
          const filterValue = value[0] === undefined && value[1] === undefined ? undefined : value

          if (filterValue === undefined) {
            return otherFilters
          }

          return [
            ...otherFilters,
            {
              id: 'studentCount',
              value: filterValue,
            },
          ]
        })
      }, 300),
    []
  )
  const [search, setSearch] = useState<string>('')
  const [studentCountInput, setStudentCountInput] = useState<[string, string]>(['', ''])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const groupName = row.original.name.toLowerCase()
      return groupName.includes(searchValue)
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
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
        <Field>
          <Input
            placeholder="От..."
            type="number"
            value={studentCountInput[0]}
            onChange={(e) => {
              const val = e.target.value
              setStudentCountInput((prev) => [val, prev[1]])
              handleStudentCountFilterChange([
                val ? Number(val) : undefined,
                studentCountInput[1] ? Number(studentCountInput[1]) : undefined,
              ])
            }}
          />
        </Field>
        <Field>
          <Input
            placeholder="До..."
            type="number"
            value={studentCountInput[1]}
            onChange={(e) => {
              const val = e.target.value
              setStudentCountInput((prev) => [prev[0], val])
              handleStudentCountFilterChange([
                studentCountInput[0] ? Number(studentCountInput[0]) : undefined,
                val ? Number(val) : undefined,
              ])
            }}
          />
        </Field>
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
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
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
