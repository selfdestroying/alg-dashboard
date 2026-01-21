'use client'

import { ColumnDef } from '@tanstack/react-table'

import { PaymentProduct } from '@prisma/client'
import DataTable from '../../../../../components/data-table'

const getColumns = (): ColumnDef<PaymentProduct>[] => [
  {
    header: 'Название',
    accessorKey: 'name',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'amoCRM ID',
    accessorKey: 'productId',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Цена',
    accessorKey: 'price',
    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Кол-во занятий',
    accessorKey: 'lessonCount',
    meta: {
      filterVariant: 'range',
    },
  },
]

export default function PaymentProductsTable({
  paymentProducts,
}: {
  paymentProducts: PaymentProduct[]
}) {
  const columns = getColumns()
  return <DataTable data={paymentProducts} columns={columns} paginate />
}
