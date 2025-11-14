'use client'
import { DismissedWithStudentAndGroup } from '@/actions/dismissed'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
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
    accessorFn: (data) => data.date.toLocaleDateString('ru-RU'),
    meta: {
      filterVariant: 'text',
    },
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
