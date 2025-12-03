'use client'
import { getGroup, removeFromGroup } from '@/actions/groups'
import DataTable from '@/components/data-table'
import DeleteAction from '@/components/delete-action'
import { Button } from '@/components/ui/button'
import { Prisma } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo } from 'react'
import FormDialog from '../button-dialog'
import DismissForm from '../forms/dismiss-form'
import { StudentGroupDialog } from '../student-group-dialog'

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

const getColumns = (groupId: number): ColumnDef<StudentWithAttendances>[] => [
  {
    id: 'id',
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
      <>
        <FormDialog
          FormComponent={DismissForm}
          title="Перевести в отток"
          icon="doorOpen"
          formComponentProps={{
            groupId,
            studentId: row.original.id,
          }}
          triggerButtonProps={{ variant: 'ghost', size: 'icon' }}
          submitButtonProps={{ form: 'dismiss-form' }}
        />
        <StudentGroupDialog
          variant="icon"
          studentId={row.original.id}
          fromGroupId={groupId}
        />
        <DeleteAction
          id={row.original.id}
          action={() => removeFromGroup({ studentId: row.original.id, groupId })}
          confirmationText={`${row.original.firstName} ${row.original.lastName}`}
        />
      </>
    ),
  },
]

export function GroupStudentsTable({
  students,
  data,
}: {
  data: Awaited<ReturnType<typeof getGroup>>
  students: StudentWithAttendances[]
}) {
  const columns = useMemo(() => getColumns(data.id), [data.id])

  return <DataTable data={students} columns={columns} paginate={false} />
}
