'use client'
import { DismissedWithStudentAndGroup, removeFromDismissed } from '@/actions/dismissed'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import DataTable from '../data-table'
import { Button } from '../ui/button'
import { Undo } from 'lucide-react'
import { addToGroup } from '@/actions/groups'
import { toast } from 'sonner'

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
    accessorFn: (data) => data.date.toLocaleDateString('ru-RU'),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Действия',
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" onClick={() => {
        const ok = Promise.all([addToGroup({groupId: row.original.groupId, studentId: row.original.studentId}), removeFromDismissed({ where: { id: row.original.id } })])
        toast.promise(ok, {
          loading: 'Возвращение ученика...',
          success: 'Ученик успешно возвращен в группу',
          error: (e) => e.message,
        })
      }}>
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
