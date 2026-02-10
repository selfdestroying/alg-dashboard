'use client'

import DataTable from '@/src/components/data-table'
import TableFilter, { TableFilterItem } from '@/src/components/table-filter'
import { Field, FieldGroup } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useMappedCourseListQuery } from '@/src/data/course/course-list-query'
import { useMappedLocationListQuery } from '@/src/data/location/location-list-query'
import { useMappedMemberListQuery } from '@/src/data/member/member-list-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { DaysOfWeek, getFullName, getGroupName } from '@/src/lib/utils'
import { GroupDTO } from '@/src/types/group'
import {
  ColumnDef,
  ColumnFiltersState,
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
import Link from 'next/link'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'

const columns: ColumnDef<GroupDTO>[] = [
  {
    header: 'Группа',
    accessorFn: (value) => value.id,
    cell: ({ row }) => (
      <Link href={`/dashboard/groups/${row.original.id}`} className="text-primary hover:underline">
        {getGroupName(row.original)}
      </Link>
    ),
  },
  {
    header: 'День',
    accessorKey: 'dayOfWeek',
    cell: ({ row }) =>
      row.original.dayOfWeek !== null ? DaysOfWeek.full[row.original.dayOfWeek] : '-',
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
    accessorFn: (value) => value.students.length,
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

export default function GroupsTable({ data }: { data: GroupDTO[] }) {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.members[0].organizationId
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
      const groupName = row.original.name.toLowerCase()
      return groupName.includes(searchValue)
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

  if (isSessionLoading || !session) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <DataTable
      table={table}
      emptyMessage="Нет групп."
      showPagination
      toolbar={
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
          <Filters organizationId={organizationId!} setFilters={setColumnFilters} />
        </FieldGroup>
      }
    />
  )
}

interface FiltersProps {
  organizationId: number
  setFilters: Dispatch<SetStateAction<ColumnFiltersState>>
}

function Filters({ organizationId, setFilters }: FiltersProps) {
  const { data: courses, isLoading: isCoursesLoading } = useMappedCourseListQuery(organizationId)
  const { data: locations, isLoading: isLocationsLoading } =
    useMappedLocationListQuery(organizationId)
  const { data: mappedUsers, isLoading: isMembersLoading } =
    useMappedMemberListQuery(organizationId)

  if (isCoursesLoading || isLocationsLoading || isMembersLoading) {
    return (
      <>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </>
    )
  }

  const handleCourseFilterChange = (selectedCourses: TableFilterItem[]) => {
    const courseIds = selectedCourses.map((course) => Number(course.value))
    setFilters((old) => {
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
    setFilters((old) => {
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
    setFilters((old) => {
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

  return (
    <>
      {courses ? (
        <TableFilter label="Курс" items={courses} onChange={handleCourseFilterChange} />
      ) : (
        <Skeleton className="h-8 w-full" />
      )}
      {locations ? (
        <TableFilter label="Локация" items={locations} onChange={handleLocationFilterChange} />
      ) : (
        <Skeleton className="h-8 w-full" />
      )}
      {mappedUsers ? (
        <TableFilter label="Преподаватель" items={mappedUsers} onChange={handleUserFilterChange} />
      ) : (
        <Skeleton className="h-8 w-full" />
      )}
    </>
  )
}
