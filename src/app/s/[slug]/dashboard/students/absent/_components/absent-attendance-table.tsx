'use client'
import { AttendanceWithStudents } from '@/src/actions/attendance'
import DataTable from '@/src/components/data-table'
import TableFilter, { TableFilterItem } from '@/src/components/table-filter'
import { Button } from '@/src/components/ui/button'
import { Calendar, CalendarDayButton } from '@/src/components/ui/calendar'
import { FieldGroup } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
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
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { startOfDay } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import { debounce } from 'es-toolkit'
import Link from 'next/link'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
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
    id: 'course',
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
    filterFn: (row, id, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.lesson.group.course.id)
    },
  },
  {
    id: 'teacher',
    header: 'Преподаватель',
    cell: ({ row }) => {
      const teachers = row.original.lesson.group.teachers
      if (!teachers || teachers.length === 0) return <span>-</span>
      return (
        <div className="flex gap-x-1">
          {teachers.map((t, index) => (
            <span key={t.teacher.id}>
              <Link
                href={`/dashboard/organization/members/${t.teacher.id}`}
                className="text-primary hover:underline"
              >
                {getFullName(t.teacher.firstName, t.teacher.lastName)}
              </Link>
              {index < teachers.length - 1 && ', '}
            </span>
          ))}
        </div>
      )
    },
    filterFn: (row, columnId, filterValue) => {
      const teacherIds = row.original.lesson.group.teachers?.map((t) => t.teacher.id) ?? []
      return (
        filterValue.length === 0 || teacherIds.some((teacherId) => filterValue.includes(teacherId))
      )
    },
  },
  {
    id: 'location',
    header: 'Локация',
    cell: ({ row }) => row.original.lesson.group.location?.name ?? '-',
    filterFn: (row, id, filterValue) => {
      return (
        filterValue.length === 0 || filterValue.includes(row.original.lesson.group.location?.id)
      )
    },
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
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const organizationId = session?.members[0].organizationId
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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
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

  if (isSessionLoading || !session) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <DataTable
      table={table}
      emptyMessage="Нет учеников."
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
          <Filters organizationId={organizationId!} setFilters={setColumnFilters} />
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
