'use client'
import { Category } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'

const getColumns = (): ColumnDef<Category>[] => [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Название',
    accessorKey: 'name',
    meta: {
      filterVariant: 'text',
    },
  },
  {
    id: 'actions',
    header: 'Действия',
  },
]

export default function CategoriesTable({ categories }: { categories: Category[] }) {
  const columns = getColumns()
  return <></>
}
