'use client'
import { DismissedWithStudentAndGroup } from '@/src/actions/dismissed'
import DataTable from '@/src/components/data-table'
import TableFilter, { TableFilterItem } from '@/src/components/table-filter'
import { FieldGroup } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useMappedCourseListQuery } from '@/src/data/course/course-list-query'
import { useMappedLocationListQuery } from '@/src/data/location/location-list-query'
import { useMappedMemberListQuery } from '@/src/data/member/member-list-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { getFullName, getGroupName } from '@/src/lib/utils'
import {
  ColumnDef,
  ColumnFiltersState,
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
import Link from 'next/link'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
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
        {getGroupName(row.original.group)}
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
                href={`/dashboard/organization/members/${t.teacher.id}`}
                className="text-primary hover:underline"
              >
                {t.teacher.name}
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
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.organizationId
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

  if (isSessionLoading || !session) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <DataTable
      table={table}
      emptyMessage="Нет отчисленных учеников."
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
