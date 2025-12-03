'use client'
import { deleteStudent } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { Student } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import DataTable from '../data-table'
import DeleteAction from '../delete-action'

const getColumns = (): ColumnDef<Student>[] => [
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
    header: 'Возраст',
    accessorKey: 'age',
    meta: {
      filterVariant: 'range',
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
        <a target="_blank" href={row.getValue('crmUrl')}>
          {row.getValue('crmUrl') || 'Нет ссылки'}
        </a>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата создания',
    cell: ({ row }) => row.original.createdAt.toLocaleDateString('ru-RU')
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
    header: 'Всего уроков',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    accessorKey: 'totalPayments',
    header: 'Всего оплат',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    accessorKey: 'login',
    header: 'Логин',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    accessorKey: 'password',
    header: 'Пароль',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    accessorKey: 'coins',
    header: 'Астрокоины',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    id: 'actions',
    header: 'Действия',
    cell: ({ row }) => (
      <DeleteAction
        id={row.original.id}
        action={deleteStudent}
        confirmationText={`${row.original.firstName} ${row.original.lastName}`}
      />
    ),
  },
]

export function StudentsTable({ data }: { data: Student[] }) {
  const columns = getColumns()
  return <DataTable data={data} columns={columns} paginate defaultColumnVisibility={
    {
      login: false,
      password: false,
      coins: false
    }
  } />
}
