'use client'

import { updateUnprocessedPayment } from '@/actions/payments'
import { UnprocessedPayment } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { FileJson } from 'lucide-react'
import DataTable from '../data-table'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

const getColumns = (): ColumnDef<UnprocessedPayment>[] => [
  {
    header: 'Статус',
    accessorKey: 'resolved',
    cell: ({ row }) =>
      row.original.resolved ? (
        <div className="bg-success size-2 rounded-full" aria-hidden="true"></div>
      ) : (
        <div className="bg-destructive size-2 rounded-full" aria-hidden="true"></div>
      ),
    size: 25,
    meta: {
      filterVariant: 'text',
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
        <DialogTrigger asChild>
          <Button variant={'outline'} size={'icon'}>
            <FileJson />
          </Button>
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden">
          <div className="overflow-y-auto">
            <DialogHeader className="contents space-y-0 text-left">
              <DialogTitle className="sr-only px-6 pt-6">Необработанные данные</DialogTitle>
              <DialogDescription asChild>
                <div className="[&_strong]:text-foreground space-y-4 p-6 [&_strong]:font-semibold">
                  <pre>
                    <code lang="json">{JSON.stringify(row.original.rawData, null, 2)}</code>
                  </pre>
                </div>
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
        <Button
          onClick={() =>
            updateUnprocessedPayment({ where: { id: row.original.id }, data: { resolved: true } })
          }
        >
          Разобрать
        </Button>
      ),
  },
]

export default function UnprocessedPaymentTable({
  unprocessedPayments,
}: {
  unprocessedPayments: UnprocessedPayment[]
}) {
  const columns = getColumns()
  return (
    <DataTable
      data={unprocessedPayments}
      columns={columns}
      paginate
      defaultColumnVisibility={{
        resolved: false,
      }}
    />
  )
}
