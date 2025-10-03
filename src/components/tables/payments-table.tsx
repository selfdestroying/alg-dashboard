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
    header: 'Имя сделки',
    accessorKey: 'leadName',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Название товара',
    accessorKey: 'productName',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Занятий оплачено',
    accessorKey: 'lessonCount',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Сумма',
    accessorKey: 'price',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Ставка за урок',
    accessorKey: 'bidForLesson',
    meta: {
      filterVariant: 'range',
    },
  },
]

export default function PaymentsTable({ payments }: { payments: PaymentsWithStudentAndGroup[] }) {
  const columns = getColumns()
  return <DataTable data={payments} columns={columns} paginate />
}
