'use client'

import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'

import { ProductWithCategory } from '@/actions/products'

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
    cell: ({ row }) => <div className="space-x-2"></div>,
    enableHiding: false,
  },
]

export default function ProductsTable({ products }: { products: ProductWithCategory[] }) {
  const columns = getColumns()
  return <></>
}
