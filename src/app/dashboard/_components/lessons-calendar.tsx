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
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { endOfMonth, startOfDay, startOfMonth } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { ru } from 'date-fns/locale'
import { ArrowDown, ArrowUp, Check, X } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react'

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
      return [{ id: 'teacher', value: [user.id] }]
    }
    return []
  })

  const [isPending, startTransition] = useTransition()

  const [daysStatuses, setDaysStatuses] = useState<Record<number, boolean[]>>({})
  const [selectedDayLessons, setSelectedDayLessons] = useState<LessonWithDetails[]>([])

  // Универсальный обработчик для всех фильтров
  const handleFilterChange = useCallback((filterId: string, items: TableFilterItem[]) => {
    const ids = items.map((item) => Number(item.value))
    setColumnFilters((prev) => {
      const otherFilters = prev.filter((filter) => filter.id !== filterId)
      return ids.length > 0 ? [...otherFilters, { id: filterId, value: ids }] : otherFilters
    })
  }, [])

  const handleCourseFilterChange = useCallback(
    (items: TableFilterItem[]) => handleFilterChange('course', items),
    [handleFilterChange]
  )

  const handleLocationFilterChange = useCallback(
    (items: TableFilterItem[]) => handleFilterChange('location', items),
    [handleFilterChange]
  )

  const handleUserFilterChange = useCallback(
    (items: TableFilterItem[]) => handleFilterChange('teacher', items),
    [handleFilterChange]
  )

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
    let isCancelled = false

    if (!selectedDay) {
      startTransition(() => {
        setSelectedDayLessons([])
      })
      return
    }

    startTransition(() => {
      const zonedDate = fromZonedTime(startOfDay(selectedDay), 'Europe/Moscow')
      getLessons({
        where: { date: zonedDate },
        include: {
          attendance: true,
          group: { include: { course: true, location: true } },
          teachers: { include: { teacher: true } },
        },
        orderBy: { time: 'asc' },
      }).then((lessons) => {
        if (!isCancelled) {
          setSelectedDayLessons(lessons)
        }
      })
    })

    return () => {
      isCancelled = true
    }
  }, [selectedDay])

  useEffect(() => {
    let isCancelled = false

    startTransition(() => {
      const from = startOfMonth(selectedMonth)
      const to = endOfMonth(selectedMonth)
      getLessons({
        where: {
          date: {
            gte: from,
            lte: to,
          },
          status: 'ACTIVE',
        },
        select: {
          date: true,
          attendance: { select: { status: true } },
        },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      }).then((lessons) => {
        if (isCancelled) return

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

    return () => {
      isCancelled = true
    }
  }, [selectedMonth])

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[2fr_3fr] gap-2 md:grid-cols-[auto_1fr] md:grid-rows-1">
      <Card className="overflow-y-auto">
        <CardContent>
          <Calendar
            today={today}
            mode="single"
            selected={selectedDay}
            month={selectedMonth}
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
                const dayIndex = daysStatuses[day.date.getDate()]

                if (!dayIndex) {
                  return (
                    <CalendarDayButton
                      {...props}
                      day={day}
                      data-day={day.date.toLocaleDateString('ru-RU')}
                    >
                      {children}
                    </CalendarDayButton>
                  )
                }

                const hasUnmarked = dayIndex.some((status) => status)
                const statusClassName = hasUnmarked
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-success/20 text-success'

                return (
                  <CalendarDayButton
                    {...props}
                    day={day}
                    className={cn(statusClassName, 'transition-none')}
                    data-day={day.date.toLocaleDateString('ru-RU')}
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

const getColumns = (): ColumnDef<LessonWithDetails>[] => [
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
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(() => getColumns(), [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
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
