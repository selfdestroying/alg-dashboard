'use client'

import { Student, UnprocessedPayment } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { FileJson } from 'lucide-react'
import DataTable from '../data-table'
import PaymentDialogForm from '../forms/payment-form'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

const getColumns = (students: Student[]): ColumnDef<UnprocessedPayment>[] => [
  {
    header: 'Статус',
    accessorKey: 'resolved',
    accessorFn: ({ resolved }) => (resolved ? 'Разобрано' : 'Неразобрано'),
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue<string>(columnId)
      return value === filterValue
    },

    cell: ({ row }) =>
      row.original.resolved ? (
        <div className="bg-success size-2 rounded-full" aria-hidden="true"></div>
      ) : (
        <div className="bg-destructive size-2 rounded-full" aria-hidden="true"></div>
      ),
    size: 25,
    meta: {
      filterVariant: 'select',
    },
  },
  {
    header: 'Причина',
    accessorKey: 'reason',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Необработанные данные',
    accessorKey: 'rawData',
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger render={<Button variant={'outline'} size={'icon'} />}>
          <FileJson />
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden">
          <div className="overflow-y-auto">
            <DialogHeader className="contents space-y-0 text-left">
              <DialogTitle className="sr-only px-6 pt-6">Необработанные данные</DialogTitle>
              <DialogDescription
                render={
                  <div className="[&_strong]:text-foreground space-y-4 p-6 [&_strong]:font-semibold" />
                }
              >
                <pre>
                  <code lang="json">{JSON.stringify(row.original.rawData, null, 2)}</code>
                </pre>
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogContent>
      </Dialog>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Дата',
    accessorKey: 'createdAt',
    cell: ({ row }) => row.original.createdAt.toLocaleString('ru-RU'),
    meta: {
      filterVariant: 'text',
    },
  },

  {
    header: 'Действия',
    cell: ({ row }) =>
      !row.original.resolved && (
        <PaymentDialogForm students={students} unprocessedPayment={row.original} />
      ),
  },
]

export default function UnprocessedPaymentTable({
  unprocessedPayments,
  students,
}: {
  unprocessedPayments: UnprocessedPayment[]
  students: Student[]
}) {
  const columns = getColumns(students)
  return (
    <DataTable
      data={unprocessedPayments}
      columns={columns}
      paginate
      defaultColumnVisibility={{
        resolved: false,
      }}
      defaultFilters={[{ id: 'resolved', value: 'Неразобрано' }]}
    />
  )
}
