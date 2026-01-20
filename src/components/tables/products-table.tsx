'use client'

import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'

import { deleteProduct, ProductWithCategory } from '@/actions/products'
import DataTable from '../data-table'
import DeleteAction from '../delete-action'

const getColumns = (): ColumnDef<ProductWithCategory>[] => [
  {
    header: 'Название',
    accessorKey: 'name',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    header: 'Описание',
    accessorKey: 'description',
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
      <Button variant={'link'} size={'sm'} className="h-fit p-0 font-medium">
        <a target="_blank" href={row.original.image}>
          {row.original.image}
        </a>
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
    header: 'Действия',
    cell: ({ row }) => (
      <div className="space-x-2">
        <DeleteAction
          id={row.original.id}
          action={deleteProduct}
          confirmationText={row.original.name}
        />
      </div>
    ),
    enableHiding: false,
  },
]

export default function ProductsTable({ products }: { products: ProductWithCategory[] }) {
  const columns = getColumns()
  return <DataTable data={products} columns={columns} paginate />
}
