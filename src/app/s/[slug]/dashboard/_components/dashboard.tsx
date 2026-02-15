'use client'

import { Prisma } from '@/prisma/generated/client'
import TableFilter, { TableFilterItem } from '@/src/components/table-filter'
import { Calendar, CalendarDayButton } from '@/src/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/src/components/ui/card'
import { FieldGroup } from '@/src/components/ui/field'
import { Skeleton } from '@/src/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { useMappedCourseListQuery } from '@/src/data/course/course-list-query'
import { useDayStatusesQuery, useLessonListQuery } from '@/src/data/lesson/lesson-list-query'
import { useMappedLocationListQuery } from '@/src/data/location/location-list-query'
import { useMappedMemberListQuery } from '@/src/data/member/member-list-query'
import { useOrganizationPermissionQuery } from '@/src/data/organization/organization-permission-query'
import { useSessionQuery } from '@/src/data/user/session-query'
import { cn } from '@/src/lib/utils'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowDown, ArrowUp, Check, X } from 'lucide-react'
import Link from 'next/link'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { CalendarDay } from 'react-day-picker'

const LESSON_COLUMNS: ColumnDef<LessonWithDetails>[] = [
  {
    header: 'Урок',
    cell: (info) => (
      <Link
        href={`/dashboard/lessons/${info.row.original.id}`}
        className="text-primary hover:underline"
      >
        Ссылка
      </Link>
    ),
  },
  {
    id: 'course',
    header: 'Курс',
    accessorKey: 'group.course.id',
    cell: ({ row }) => row.original.group.course.name,
    filterFn: (row, columnId, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.group.course.id)
    },
  },
  {
    header: 'Время',
    accessorKey: 'time',
    cell: (info) => info.getValue(),
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
                href={`/dashboard/organization/members/${t.teacher.id}`}
                className="text-primary hover:underline"
              >
                {t.teacher.name}
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
    id: 'location',
    header: 'Локация',
    accessorFn: (lesson) => lesson.group.location?.id,
    cell: (info) => info.row.original.group.location?.name,
    filterFn: (row, columnId, filterValue) => {
      return filterValue.length === 0 || filterValue.includes(row.original.group.location?.id)
    },
  },
  {
    header: 'Отметки',
    accessorFn: (lesson) =>
      lesson.attendance.some((a) => a.status === 'UNSPECIFIED') ? 'unmarked' : 'marked',
    cell: (info) =>
      info.getValue() === 'marked' ? (
        <div className="text-success flex items-center gap-2">
          <Check className="size-4" />
        </div>
      ) : (
        <div className="text-destructive flex items-center gap-2">
          <X className="size-4" />
        </div>
      ),
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: (info) => (
      <span className={info.getValue() === 'ACTIVE' ? 'text-success' : 'text-muted-foreground'}>
        {info.getValue() === 'ACTIVE' ? 'Активен' : 'Неактивен'}
      </span>
    ),
  },
]

type LessonWithDetails = Prisma.LessonGetPayload<{
  include: {
    attendance: true
    group: { include: { course: true; location: true } }
    teachers: { include: { teacher: true } }
  }
}>

export default function Dashboard() {
  const { data: session, isLoading: isSessionLoading } = useSessionQuery()
  const { data: hasPermission, isLoading: isPermissionLoading } = useOrganizationPermissionQuery({
    lesson: ['readAll'],
  })

  const [selectedDay, setSelectedDay] = useState<Date>(startOfDay(new Date()))
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const dayKey = useMemo(() => startOfDay(selectedDay), [selectedDay])
  const columns = useMemo(() => LESSON_COLUMNS, [])

  const organizationId = session?.organizationId
  const { data: lessons } = useLessonListQuery(organizationId!, dayKey)
  const canReadAllLessons = !!hasPermission?.success
  const lockedTeacherId =
    !canReadAllLessons && session?.user?.id != null ? Number(session.user.id) : undefined
  const effectiveFilters = useMemo(() => {
    if (!lockedTeacherId) return filters
    const otherFilters = filters.filter((filter) => filter.id !== 'teacher')
    return [
      ...otherFilters,
      {
        id: 'teacher',
        value: [lockedTeacherId],
      },
    ]
  }, [filters, lockedTeacherId])

  if (isSessionLoading || isPermissionLoading || !session) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[2fr_3fr] gap-2 md:grid-cols-[auto_1fr] md:grid-rows-1">
      <Card className="overflow-y-auto">
        <CardContent>
          <LessonCalendar
            organizationId={organizationId!}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </CardContent>
        <CardFooter>
          <Filters
            organizationId={organizationId!}
            setFilters={setFilters}
            lockedTeacherId={lockedTeacherId}
            disableTeacherFilter={!!lockedTeacherId}
          />
        </CardFooter>
      </Card>

      <Card>
        <CardContent className="overflow-y-auto">
          <DataTable data={lessons ?? []} columns={columns} filters={effectiveFilters} />
        </CardContent>
      </Card>
    </div>
  )
}

interface LessonCalendarProps {
  organizationId: number
  selectedDay: Date
  onSelectDay: (day: Date) => void
}

function LessonCalendar({ organizationId, selectedDay, onSelectDay }: LessonCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const dayKey = useMemo(() => startOfDay(selectedMonth), [selectedMonth])
  const { data: daysStatuses, isLoading: isDaysStatusesLoading } = useDayStatusesQuery(
    organizationId,
    dayKey
  )

  return (
    <Calendar
      mode="single"
      required
      selected={selectedDay}
      onSelect={onSelectDay}
      month={selectedMonth}
      onMonthChange={setSelectedMonth}
      classNames={{ week: 'flex gap-2 mt-2' }}
      showOutsideDays={false}
      locale={ru}
      disabled={isDaysStatusesLoading}
      disableNavigation={isDaysStatusesLoading}
      className="bg-transparent p-0 [--cell-size:--spacing(8)]"
      components={{
        DayButton: (props) =>
          isDaysStatusesLoading ? (
            <CalendarDayButton {...props} />
          ) : (
            <LessonDayButton {...props} daysStatuses={daysStatuses!} />
          ),
      }}
    />
  )
}

interface CalendarDayButtonProps extends React.ComponentProps<typeof CalendarDayButton> {
  day: CalendarDay
  children?: React.ReactNode
  daysStatuses: Record<string, boolean[]>
}

function LessonDayButton({ day, children, daysStatuses, ...props }: CalendarDayButtonProps) {
  const dayIndex = daysStatuses[day.date.toISOString().split('T')[0]]
  if (!dayIndex)
    return (
      <CalendarDayButton {...props} day={day}>
        {children}
      </CalendarDayButton>
    )

  const dayStatus = dayIndex.some(Boolean) ? 'unmarked' : 'marked'
  const statusClassNames = {
    unmarked: 'bg-destructive/20 text-destructive',
    marked: 'bg-success/20 text-success',
  }

  return (
    <CalendarDayButton
      {...props}
      day={day}
      className={cn(statusClassNames[dayStatus] || '', 'transition-none')}
      data-day={day.date.toLocaleDateString('ru-RU')}
    >
      {children}
    </CalendarDayButton>
  )
}

interface FiltersProps {
  organizationId: number
  setFilters: Dispatch<SetStateAction<ColumnFiltersState>>
  lockedTeacherId?: string | number
  disableTeacherFilter?: boolean
}

function Filters({
  organizationId,
  setFilters,
  lockedTeacherId,
  disableTeacherFilter,
}: FiltersProps) {
  const { data: courses, isLoading: isCoursesLoading } = useMappedCourseListQuery(organizationId)
  const { data: locations, isLoading: isLocationsLoading } =
    useMappedLocationListQuery(organizationId)
  const { data: mappedUsers, isLoading: isMembersLoading } =
    useMappedMemberListQuery(organizationId)

  if (isCoursesLoading || isLocationsLoading || isMembersLoading) {
    return (
      <FieldGroup>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </FieldGroup>
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
    if (disableTeacherFilter) return
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

  const lockedTeacherValue =
    lockedTeacherId && mappedUsers
      ? mappedUsers.find((user) => user.value === lockedTeacherId.toString())
      : undefined

  return (
    <FieldGroup>
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
        <TableFilter
          label="Преподаватель"
          items={mappedUsers}
          onChange={handleUserFilterChange}
          disabled={disableTeacherFilter}
          value={lockedTeacherValue ? [lockedTeacherValue] : undefined}
        />
      ) : (
        <Skeleton className="h-8 w-full" />
      )}
    </FieldGroup>
  )
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  filters?: ColumnFiltersState
}

function DataTable<T>({ data, columns, filters }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters: filters,
    },
  })

  return (
    <div>
      <Table>
        <TableHeader>
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
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                Нет уроков в этот день.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
