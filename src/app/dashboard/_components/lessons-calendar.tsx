'use client'

import { getLessons } from '@/actions/lessons'
import TableFilter, { TableFilterItem } from '@/components/table-filter'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePermission } from '@/hooks/usePermission'
import { cn, getFullName } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useData } from '@/providers/data-provider'
import { Prisma } from '@prisma/client'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import { Check, X } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useMemo, useState, useTransition } from 'react'

type LessonWithDetails = Prisma.LessonGetPayload<{
  include: {
    attendance: true
    group: { include: { course: true; location: true } }
    teachers: { include: { teacher: true } }
  }
}>

export default function LessonsCalendar() {
  const { courses, locations, users } = useData()
  const user = useAuth()
  const canViewOtherLessons = usePermission('VIEW_OTHER_LESSONS')
  const today = toZonedTime(new Date(), 'Europe/Moscow')

  const [selectedDay, setSelectedDay] = useState<Date | undefined>(today)
  const [selectedMonth, setSelectedMonth] = useState<Date>(today)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    if (!canViewOtherLessons) {
      return [
        {
          id: 'teacher',
          value: [user.id],
        },
      ]
    }
    return []
  })

  const [isPending, startTransition] = useTransition()

  const [daysStatuses, setDaysStatuses] = useState<Record<number, boolean[]>>({})
  const [selectedDayLessons, setSelectedDayLessons] = useState<LessonWithDetails[]>([])

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

  useEffect(() => {
    if (!selectedDay) {
      startTransition(() => {
        setSelectedDayLessons([])
      })
      return
    }
    startTransition(() => {
      const zonedDate = selectedDay
      getLessons({
        where: {
          date: startOfDay(zonedDate),
        },
        include: {
          attendance: true,
          group: { include: { course: true, location: true } },
          teachers: { include: { teacher: true } },
        },
        orderBy: { time: 'asc' },
      }).then((lessons) => {
        setSelectedDayLessons(lessons)
      })
    })
  }, [selectedDay])

  useEffect(() => {
    startTransition(() => {
      const zonedDate = toZonedTime(selectedMonth, 'Europe/Moscow')
      const year = zonedDate.getFullYear()
      const month = zonedDate.getMonth()

      const startOfMonth = new Date(year, month, 1)
      const startOfNextMonth = new Date(year, month + 1, 1)
      getLessons({
        where: {
          date: {
            gte: startOfDay(startOfMonth),
            lt: startOfDay(startOfNextMonth),
          },
          status: 'ACTIVE',
        },
        include: {
          attendance: {
            select: { status: true },
          },
        },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      }).then((lessons) => {
        const statuses: Record<number, boolean[]> = {}
        lessons.forEach((lesson) => {
          const day = toZonedTime(lesson.date, 'Europe/Moscow').getDate()
          const hasUnspecified = lesson.attendance.some(
            (attendance) => attendance.status === 'UNSPECIFIED'
          )
          if (!statuses[day]) {
            statuses[day] = []
          }
          statuses[day].push(hasUnspecified)
        })
        setDaysStatuses(statuses)
      })
    })
  }, [selectedMonth])

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[2fr_3fr] gap-2 md:grid-cols-[auto_1fr] md:grid-rows-1">
      <Card className="overflow-y-auto">
        <CardContent>
          <Calendar
            today={today}
            mode="single"
            selected={selectedDay}
            defaultMonth={selectedDay}
            onSelect={setSelectedDay}
            onMonthChange={setSelectedMonth}
            classNames={{ week: 'flex gap-2 mt-2' }}
            showOutsideDays={false}
            locale={ru}
            className="bg-transparent p-0 [--cell-size:--spacing(8)]"
            disabled={isPending}
            disableNavigation={isPending}
            components={{
              DayButton: ({ children, day, ...props }) => {
                const dayIndex = daysStatuses[toZonedTime(day.date, 'Europe/Moscow').getDate()]
                if (!dayIndex) {
                  return (
                    <CalendarDayButton {...props} day={day}>
                      {children}
                    </CalendarDayButton>
                  )
                }
                const dayStatus = dayIndex.some((status) => status) ? 'unmarked' : 'marked'
                const statusClassNames = {
                  unmarked: 'bg-destructive/20 text-destructive',
                  marked: 'bg-success/20 text-success',
                }

                return (
                  <CalendarDayButton
                    {...props}
                    day={day}
                    className={cn(statusClassNames[dayStatus] || '', 'transition-none')}
                  >
                    {children}
                  </CalendarDayButton>
                )
              },
            }}
          />
        </CardContent>
        {canViewOtherLessons && (
          <CardFooter>
            <FieldGroup>
              <TableFilter label="Курс" items={mappedCourses} onChange={handleCourseFilterChange} />
              <TableFilter
                label="Локация"
                items={mappedLocations}
                onChange={handleLocationFilterChange}
              />
              <TableFilter
                label="Преподаватель"
                items={mappedUsers}
                onChange={handleUserFilterChange}
              />
            </FieldGroup>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          Уроки {selectedDay ? `на ${selectedDay.toLocaleDateString('ru-RU')}` : ''}
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <DataTable
            data={selectedDayLessons}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
          />
        </CardContent>
      </Card>
    </div>
  )
}

interface DataTableProps {
  data: LessonWithDetails[]
  columnFilters: ColumnFiltersState
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
}

const columns: ColumnDef<LessonWithDetails>[] = [
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

function DataTable({ data, columnFilters, setColumnFilters }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
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
                Нет уроков в этот день.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
