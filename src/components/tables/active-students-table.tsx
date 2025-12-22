'use client'
import { Button } from '@/components/ui/button'
import { Prisma } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import DataTable from '../data-table'

type ActiveStudent = Prisma.StudentGetPayload<{
  include: {
    groups: {
      include: {
        group: true
      }
    }
    payments: true
  }
}>

const getColumns = (): ColumnDef<ActiveStudent>[] => [
  {
    header: 'Полное имя',
    accessorKey: 'fullName',
    accessorFn: (value) => `${value.firstName} ${value.lastName}`,
    cell: ({ row }) => (
      <Button asChild variant={'link'} className="h-fit p-0 font-medium">
        <Link href={`/dashboard/students/${row.original.id}`}>
          {row.original.firstName} {row.original.lastName}
        </Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'ФИО Родителя',
    accessorKey: 'parentsName',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Ссылка в amoCRM',
    accessorKey: 'crmUrl',
    cell: ({ row }) => (
      <Button asChild variant={'link'} className="h-fit w-fit p-0 font-medium">
        <a target="_blank" href={row.getValue('crmUrl') || '#'} rel="noopener noreferrer">
          {row.getValue('crmUrl') ? 'Ссылка' : 'Нет ссылки'}
        </a>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Кол-во групп',
    accessorFn: (row) => row.groups.length,
    accessorKey: 'groupsCount',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    accessorKey: 'lessonsBalance',
    header: 'Баланс уроков',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    accessorKey: 'totalLessons',
    header: 'Оплачено уроков',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    accessorKey: 'totalPayments',
    header: 'Сумма оплат',
    meta: {
      filterVariant: 'range',
    },
  },
]

export function ActiveStudentsTable({ data }: { data: ActiveStudent[] }) {
  const columns = getColumns()
  return <DataTable data={data} columns={columns} paginate />
}
