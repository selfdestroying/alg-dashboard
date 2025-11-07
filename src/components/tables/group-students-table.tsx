'use client'
import { getGroup, removeFromGroup } from '@/actions/groups'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AttendanceStatus, Lesson, Prisma } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo } from 'react'
import DataTable from '../data-table'
import DeleteAction from '../delete-action'
import DragScrollArea from '../drag-scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

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
      <div className="text-muted-foreground rounded-lg border-4 px-2">
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
const getColumns = (lessons: Lesson[], groupId: number): ColumnDef<StudentWithAttendances>[] => [
  {
    id: '№',
    header: '№',
    cell: ({ row }) => row.index + 1,
    size: 10,
  },
  {
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
    size: 100,
  },
  // {
  //   header: 'Статус',
  //   accessorFn: (item) => item.groups[0].status,
  //   cell: ({ row }) => (
  //     <Badge variant={'outline'} className={studentStatus[row.original.groups[0].status]}>
  //       {StudentStatusMap[row.original.groups[0].status]}
  //     </Badge>
  //   ),
  // },
  {
    header: 'Посещаемость',
    accessorKey: 'attendance',
    cell: ({ row }) => (
      <DragScrollArea
        initialScroll={
          (lessons.reduce((prev, curr) => prev + (curr.date < new Date() ? 1 : 0), 0) - 1) * 100
        }
      >
        {lessons.map((lesson) => {
          const attendance = row.original.attendances.find((a) => a.lessonId === lesson.id)
          return <AttendanceCell key={lesson.id} lesson={lesson} attendance={attendance} />
        })}
      </DragScrollArea>
    ),
    size: 400,
  },
  { header: 'Возраст', accessorKey: 'age', meta: { filterVariant: 'range' } },
  { header: 'ФИО Родителя', accessorKey: 'parentsName', meta: { filterVariant: 'text' } },
  {
    header: 'Ссылка в amoCRM',
    accessorKey: 'crmUrl',
    cell: ({ row }) => (
      <Button asChild variant="link" className="h-fit w-fit p-0 font-medium">
        <a target="_blank" href={row.getValue('crmUrl') || '#'}>
          {row.getValue('crmUrl') || 'Нет ссылки'}
        </a>
      </Button>
    ),
    meta: { filterVariant: 'text' },
  },
  { accessorKey: 'login', header: 'Логин', meta: { filterVariant: 'text' } },
  { accessorKey: 'password', header: 'Пароль', meta: { filterVariant: 'text' } },
  { accessorKey: 'coins', header: 'Астрокоины', meta: { filterVariant: 'range' } },
  {
    id: 'actions',
    header: 'Действия',
    cell: ({ row }) => (
      <DeleteAction
        id={row.original.id}
        action={() => removeFromGroup({ studentId: row.original.id, groupId })}
        confirmationText={`${row.original.firstName} ${row.original.lastName}`}
      />
    ),
  },
]

// -------------------- Main Component --------------------
export function GroupStudentsTable({
  lessons,
  students,
  data,
}: {
  data: Awaited<ReturnType<typeof getGroup>>
  lessons: Lesson[]
  students: StudentWithAttendances[]
}) {
  const columns = useMemo(() => getColumns(lessons, data.id), [lessons, data.id])

  return (
    <DataTable
      data={students}
      columns={columns}
      paginate={false}
      defaultColumnVisibility={{
        age: false,
        actions: false,
        coins: false,
        login: false,
        password: false,
        crmUrl: false,
        parentsName: false,
      }}
    />
  )
}
