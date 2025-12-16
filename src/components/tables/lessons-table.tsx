'use client'

import { Button } from '@/components/ui/button'

import { LessonWithAttendanceAndGroup } from '@/actions/lessons'
import { UserData } from '@/actions/users'
import { useData } from '@/providers/data-provider'
import { ColumnDef } from '@tanstack/react-table'
import { toZonedTime } from 'date-fns-tz'
import Link from 'next/link'
import DataTable from '../data-table'

const getColumns = (users: string[]): ColumnDef<LessonWithAttendanceAndGroup>[] => [
  {
    header: 'Дата',
    accessorKey: 'date',
    accessorFn: (item) =>
      toZonedTime(item.date, 'Europe/Moscow').toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/lessons/${row.original.id}`} className="font-medium">
          {row.getValue('date')}
        </Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Группа',
    accessorKey: 'group',
    accessorFn: (item) => item.group.name,
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/groups/${row.original.groupId}`} className="font-medium">
          {row.getValue('group')}
        </Link>
      </Button>
    ),

    meta: {
      filterVariant: 'select',
    },
  },
  {
    header: 'Учителя',
    accessorKey: 'teacher',
    accessorFn: (item) =>
      item.group.teachers
        .map((teacher) => `${teacher.teacher.firstName} ${teacher.teacher.lastName ?? ''}`)
        .join(', '),

    meta: {
      filterVariant: 'select',
      allFilterVariants: users,
    },
  },
  {
    header: 'Количество учеников',
    accessorKey: 'totalStudents',
    accessorFn: (item) => item.attendance.length,

    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Пропустившие',
    accessorKey: 'totalAbsents',
    accessorFn: (item) => item.attendance.filter((a) => a.status == 'ABSENT').length,
    cell: ({ row }) => {
      const value = row.getValue('totalAbsents') as number
      return (
        <div className="flex items-center gap-2">
          {value > 0 && (
            <div
              className="bg-destructive/90 size-1.5 animate-pulse rounded-full"
              aria-hidden="true"
            ></div>
          )}
          <span className="text-muted-foreground">
            {row.original.date <= new Date() ? value : '-'}
          </span>
        </div>
      )
    },

    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Не отмеченные',
    accessorKey: 'totalUnspecified',
    accessorFn: (item) => item.attendance.filter((a) => a.status == 'UNSPECIFIED').length,
    cell: ({ row }) => {
      const value = row.getValue('totalUnspecified') as number
      return (
        <div className="flex items-center gap-2">
          {value > 0
            ? row.original.date < new Date() && (
                <div
                  className="bg-destructive/90 size-1.5 animate-pulse rounded-full"
                  aria-hidden="true"
                ></div>
              )
            : row.original.date <= new Date() && (
                <div className="bg-success size-1.5 rounded-full" aria-hidden="true"></div>
              )}
          <span className="text-muted-foreground">
            {row.original.date <= new Date() ? value : '-'}
          </span>
        </div>
      )
    },

    meta: {
      filterVariant: 'range',
    },
  },
]

export default function LessonsTable({
  user,
  lessons,
}: {
  user: UserData
  lessons: LessonWithAttendanceAndGroup[]
}) {
  const { users } = useData()
  const column = getColumns(users.flatMap((user) => user.firstName))
  return (
    <DataTable
      data={lessons}
      columns={column}
      paginate
      defaultFilters={
        user.role == 'TEACHER'
          ? [
              {
                id: 'teacher',
                value: user.firstName,
              },
            ]
          : undefined
      }
    />
  )
}
