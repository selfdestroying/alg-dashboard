'use client'
import { OrderWithProductAndStudent, updateOrder } from '@/actions/orders'
import { Order, OrderStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import DataTable from '../data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const OrderStatusMap: { [key in OrderStatus]: string } = {
  CANCELLED: 'Отменен',
  COMPLETED: 'Выполнен',
  PENDING: 'В ожидании',
}

function useSkipper() {
  const shouldSkipRef = useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
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
    []
  )

  return (
    <DataTable
      data={orders}
      columns={columns}
      tableOptions={{
        autoResetPageIndex,
      }}
    />
  )
}

function StatusAction({ value, onChange }: { value: Order; onChange: (val: OrderStatus) => void }) {
  return (
    <Select
      value={value.status != 'PENDING' ? value.status : undefined}
      onValueChange={(e: OrderStatus) => onChange(e)}
    >
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
