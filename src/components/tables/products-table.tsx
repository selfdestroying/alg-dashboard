'use client'

import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'

import { deleteProduct, ProductWithCategory } from '@/actions/products'
import Link from 'next/link'
import DeleteAction from '../actions/delete-action'
import DataTable from '../data-table'

const getColumns = (): ColumnDef<ProductWithCategory>[] => [
  {
    header: 'Название',
    accessorKey: 'name',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Цена',
    accessorKey: 'price',
    cell: ({ row }) => (
      <div className="space-x-2">
        <span className="text-muted-foreground">{row.original.price}</span>
        {row.original.originalPrice && (
          <span className="text-muted-foreground line-through">{row.original.originalPrice}</span>
        )}
      </div>
    ),
    meta: {
      filterVariant: 'range',
    },
  },
  {
    header: 'Картинка',
    accessorKey: 'image',
    cell: ({ row }) => (
      <Button asChild variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <Link href={`/uploads/${row.original.image}`}>{row.original.image}</Link>
      </Button>
    ),
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Категория',
    accessorFn: (row) => row.category.name,
    meta: {
      filterVariant: 'select',
    },
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DeleteAction
        id={row.original.id}
        action={deleteProduct}
        confirmationText={row.original.name}
      />
    ),
    enableHiding: false,
  },
]

export default function ProductsTable({ products }: { products: ProductWithCategory[] }) {
  const columns = getColumns()
  return <DataTable data={products} columns={columns} />
}
