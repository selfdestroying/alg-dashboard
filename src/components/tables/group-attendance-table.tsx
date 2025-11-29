'use client'
import { getGroup } from '@/actions/groups'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AttendanceStatus, Lesson, Prisma } from '@prisma/client'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import DragScrollArea from '../drag-scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { TableB } from '../ui/table_b'

// -------------------- Types --------------------
type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
  include: {
    lesson: true
    asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
    missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
  }
}>

type StudentWithAttendances = Prisma.StudentGetPayload<{
  include: {
    groups: true

    attendances: {
      where: { lesson: { groupId: number } }
      include: {
        lesson: true
        asMakeupFor: { include: { missedAttendance: { include: { lesson: true } } } }
        missedMakeup: { include: { makeUpAttendance: { include: { lesson: true } } } }
      }
    }
  }
}>

// -------------------- Utils --------------------
const formatDate = (date: Date) => date.toLocaleDateString('ru-RU')

const statusClasses: Record<
  AttendanceStatus | 'TRIAL_PRESENT' | 'TRIAL_ABSENT' | 'TRIAL_UNSPECIFIED',
  string
> = {
  PRESENT: 'bg-success dark:bg-success text-white',
  ABSENT: 'bg-error dark:bg-error text-white',
  UNSPECIFIED: 'border-accent',

  TRIAL_ABSENT:
    'bg-linear-to-r from-info to-error dark:bg-linear-to-r from-info to-error text-white',
  TRIAL_PRESENT:
    'bg-linear-to-r from-info to-success dark:bg-linear-to-r from-info to-success text-white',
  TRIAL_UNSPECIFIED:
    'bg-linear-to-r from-info to-info dark:bg-linear-to-r from-info to-info text-white',
}

const makeupStatusClasses: Record<AttendanceStatus, string> = {
  PRESENT: 'border-success dark:border-success',
  ABSENT: 'border-error dark:border-error',
  UNSPECIFIED: 'border-accent',
}

const stickyColumnClasses: Record<string, string> = {
  id_header: 'sticky left-0 z-[1]',
  name_header: 'sticky left-8 z-[1]',
  id: 'sticky left-0 bg-background z-[1]',
  name: 'sticky left-8 bg-background z-[1]',
}

// -------------------- Attendance Cell --------------------
function AttendanceCell({
  lesson,
  attendance,
}: {
  lesson: Lesson
  attendance?: AttendanceWithRelations
}) {
  if (!attendance) {
    return (
      <div className="text-muted-foreground inline w-fit rounded-lg border-4 px-2">
        {formatDate(lesson.date)}
      </div>
    )
  }

  const attendanceStatus =
    attendance.studentStatus == 'TRIAL'
      ? statusClasses[`TRIAL_${attendance.status}`]
      : statusClasses[attendance.status]
  const makeUpStatus = attendance.missedMakeup
    ? (makeupStatusClasses[attendance.missedMakeup.makeUpAttendance.status] ??
      makeupStatusClasses.UNSPECIFIED)
    : makeupStatusClasses.UNSPECIFIED

  return (
    <Popover>
      <PopoverTrigger
        className={cn('cursor-pointer rounded-lg border-4 px-2', attendanceStatus, makeUpStatus)}
      >
        {formatDate(lesson.date)}
      </PopoverTrigger>
      <PopoverContent className="text-xs">
        <div className="space-y-1">
          <p>
            Урок –{' '}
            <Button asChild variant="link" className="h-fit p-0 font-medium">
              <Link href={`/dashboard/lessons/${lesson.id}`}>{formatDate(lesson.date)}</Link>
            </Button>{' '}
            {attendance.status === 'PRESENT'
              ? '– Пришел'
              : attendance.status === 'ABSENT'
                ? '– Пропустил'
                : ''}
          </p>
          <p>
            Отработка –{' '}
            {attendance.missedMakeup ? (
              <>
                <Button asChild variant="link" className="h-fit p-0 font-medium">
                  <Link
                    href={`/dashboard/lessons/${attendance.missedMakeup.makeUpAttendance.lessonId}`}
                  >
                    {formatDate(attendance.missedMakeup.makeUpAttendance.lesson.date)}
                  </Link>
                </Button>
                {attendance.missedMakeup.makeUpAttendance.status === 'PRESENT'
                  ? ' – Пришел'
                  : attendance.missedMakeup.makeUpAttendance.status === 'ABSENT'
                    ? ' – Пропустил'
                    : ''}
              </>
            ) : (
              ' Не нужна'
            )}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// -------------------- Columns --------------------
const getColumns = (lessons: Lesson[]): ColumnDef<StudentWithAttendances>[] => [
  {
    id: 'id',
    header: '№',
    cell: ({ row }) => row.index + 1,
    size: 10,
  },
  {
    id: 'name',
    header: 'Полное имя',
    accessorFn: (student) => `${student.firstName} ${student.lastName}`,
    cell: ({ row }) => (
      <Button asChild variant="link" className="h-fit p-0 font-medium">
        <Link href={`/dashboard/students/${row.original.id}`}>
          {row.original.firstName} {row.original.lastName}
        </Link>
      </Button>
    ),
    meta: { filterVariant: 'text' },
  },
  {
    header: 'Посещаемость',
    accessorKey: 'attendance',
    cell: ({ row }) => (
      <div className="space-x-2">
        {lessons.map((lesson) => {
          const attendance = row.original.attendances.find((a) => a.lessonId === lesson.id)
          return <AttendanceCell key={lesson.id} lesson={lesson} attendance={attendance} />
        })}
      </div>
    ),
    size: 400,
  },
]

// -------------------- Main Component --------------------
export function GroupaAttendanceTable({
  lessons,
  students,
  data,
}: {
  data: Awaited<ReturnType<typeof getGroup>>
  lessons: Lesson[]
  students: StudentWithAttendances[]
}) {
  const columns = useMemo(() => getColumns(lessons), [lessons, data.id])

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
  })

  return (
    <DragScrollArea
      initialScroll={
        (lessons.reduce((prev, curr) => prev + (curr.date < new Date() ? 1 : 0), 0) - 1) * 100
      }
    >
      <TableB className="border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className={cn(
                      'bg-sidebar border-border relative h-9 border-y select-none first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r',
                      stickyColumnClasses[header.id + '_header']
                    )}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            'flex h-full cursor-pointer items-center gap-2 select-none'
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
                          asc: (
                            <ArrowUp className="shrink-0 opacity-60" size={16} aria-hidden="true" />
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
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-accent/50 h-px border-0 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'h-[inherit] overflow-hidden last:py-0',
                        stickyColumnClasses[cell.column.id]
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
      </TableB>
    </DragScrollArea>
  )
}
