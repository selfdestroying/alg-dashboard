import { Category } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '../data-table'

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
]

export default function CategoriesTable({ categories }: { categories: Category[] }) {
  const columns = getColumns()
  return <DataTable data={categories} columns={columns} />
}
