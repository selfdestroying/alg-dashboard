'use client'
import { DismissedWithStudentAndGroup, removeFromDismissed } from '@/actions/dismissed'
import { addToGroup } from '@/actions/groups'
import { ColumnDef } from '@tanstack/react-table'
import { toZonedTime } from 'date-fns-tz'
import { Undo } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import DataTable from '../data-table'
import { Button } from '../ui/button'

const getColumns = (): ColumnDef<DismissedWithStudentAndGroup>[] => [
  {
    header: 'Имя',
    accessorFn: (data) => `${data.student.firstName} ${data.student.lastName}`,
    cell: ({ row }) => (
      <Button asChild variant={'link'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/students/${row.original.student.id}`}>
          {row.original.student.firstName} {row.original.student.lastName}
        </Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Группа',
    accessorFn: (data) => data.group.name,
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/groups/${row.original.groupId}`}>{row.original.group.name}</Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Комментарий',
    accessorKey: 'comment',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Дата',
    accessorKey: 'date',
    cell: ({ row }) =>
      toZonedTime(row.original.date, 'Europe/Moscow').toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
  },
  {
    header: 'Действия',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const ok = Promise.all([
            addToGroup({ groupId: row.original.groupId, studentId: row.original.studentId }),
            removeFromDismissed({ where: { id: row.original.id } }),
          ])
          toast.promise(ok, {
            loading: 'Возвращение ученика...',
            success: 'Ученик успешно возвращен в группу',
            error: (e) => e.message,
          })
        }}
      >
        <Undo />
      </Button>
    ),
  },
]

export default function DismissedTable({
  dismissed,
}: {
  dismissed: DismissedWithStudentAndGroup[]
}) {
  const columns = getColumns()
  return <DataTable data={dismissed} columns={columns} paginate />
}
