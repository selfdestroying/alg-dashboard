'use client'

import { Button } from '@/components/ui/button'

import { PaymentsWithStudentAndGroup } from '@/actions/payments'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import DataTable from '../data-table'

const getColumns = (): ColumnDef<PaymentsWithStudentAndGroup>[] => [
  {
    header: 'Ученик',
    accessorKey: 'student',
    accessorFn: (item) => `${item.student.firstName} ${item.student.lastName}`,
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/students/${row.original.studentId}`}>
          {row.getValue('student')}
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
        <Link href={`/dashboard/groups/${row.original.groupId}`}>{row.getValue('group')}</Link>
      </Button>
    ),
    meta: {
      filterVariant: 'select',
    },
  },
  {
    header: 'Всего занятий оплачено',
    accessorKey: 'lessonsPaid',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Осталось занятий',
    accessorKey: 'remainingLessons',
    cell: ({ row }) => {
      const value = row.getValue('remainingLessons') as number
      return (
        <div className="flex items-center gap-2">
          {value <= 0 ? (
            <div
              className="bg-destructive/90 size-1.5 animate-pulse rounded-full"
              aria-hidden="true"
            ></div>
          ) : (
            value <= 3 && (
              <div className="size-1.5 rounded-full bg-amber-500" aria-hidden="true"></div>
            )
          )}
          <span className="text-muted-foreground">{value}</span>
        </div>
      )
    },
    meta: {
      filterVariant: 'range',
    },
  },
]

export default function PaymentsTable({ payments }: { payments: PaymentsWithStudentAndGroup[] }) {
  const columns = getColumns()
  return <DataTable data={payments} columns={columns} paginate />
}
