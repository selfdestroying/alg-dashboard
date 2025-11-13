'use client'
import { getGroup, removeFromGroup } from '@/actions/groups'
import { Button } from '@/components/ui/button'
import { Lesson, Prisma } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo } from 'react'
import DataTable from './data-table'
import DeleteAction from './delete-action'

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

// -------------------- Columns --------------------
const getColumns = (groupId: number): ColumnDef<StudentWithAttendances>[] => [
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
  const columns = useMemo(() => getColumns(data.id), [lessons, data.id])

  return <DataTable data={students} columns={columns} paginate={false} />
}
