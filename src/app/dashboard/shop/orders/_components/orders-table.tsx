'use client'
import { OrderWithProductAndStudent, updateOrder } from '@/actions/orders'
import useSkipper from '@/hooks/use-skipper'
import { Order, OrderStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select'

const OrderStatusMap: { [key in OrderStatus]: string } = {
  CANCELLED: 'Отменен',
  COMPLETED: 'Выполнен',
  PENDING: 'В ожидании',
}

const getColumns = (
  skipAutoResetPageIndex: () => void
): ColumnDef<OrderWithProductAndStudent>[] => [
  {
    header: 'Товар',
    accessorFn: (item) => item.product.name,
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Цена',
    accessorFn: (item) => item.product.price,
    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Ученик',
    accessorFn: (item) => `${item.student.firstName} ${item.student.lastName}`,
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Статус',
    accessorFn: (item) => OrderStatusMap[item.status],
    cell: ({ row }) => (
      <StatusAction
        value={row.original}
        onChange={(val: OrderStatus) => {
          skipAutoResetPageIndex()
          updateOrder(row.original, val)
        }}
      />
    ),
    meta: {
      filterVariant: 'select',
    },
  },
  {
    header: 'Дата',
    accessorFn: (item) => item.createdAt.toLocaleString('ru-RU'),
    meta: {
      filterVariant: 'text',
    },
  },
]

export default function OrdersTable({ orders }: { orders: OrderWithProductAndStudent[] }) {
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
  const columns = useMemo<ColumnDef<OrderWithProductAndStudent>[]>(
    () => getColumns(skipAutoResetPageIndex),
    [skipAutoResetPageIndex]
  )

  return <></>
}

function StatusAction({ value, onChange }: { value: Order; onChange: (val: OrderStatus) => void }) {
  return (
    <Select value={value.status != 'PENDING' ? value.status : undefined}>
      <SelectTrigger size="sm">
        <SelectValue placeholder={OrderStatusMap['PENDING']} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={OrderStatus.CANCELLED}>
          <div className="bg-error size-2 rounded-full" aria-hidden="true"></div>
          {OrderStatusMap.CANCELLED}
        </SelectItem>
        <SelectItem value={OrderStatus.COMPLETED}>
          <div className="bg-success size-2 rounded-full" aria-hidden="true"></div>
          {OrderStatusMap.COMPLETED}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
