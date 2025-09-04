'use client'
import { updateCategory } from '@/actions/categories'
import { Category } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Edit } from 'lucide-react'
import { DefaultValues } from 'react-hook-form'
import { toast } from 'sonner'
import FormDialog from '../button-dialog'
import DataTable from '../data-table'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

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
    cell: ({ row }) => (
      <FormDialog
        FormComponent={EditAction}
        formComponentProps={{
          category: row.original,
          defaultValues: {
            name: row.original.name,
          },
        }}
        title="Редактровать"
        icon={Edit}
        triggerButtonProps={{
          size: 'icon',
          variant: 'ghost',
        }}
        submitButtonProps={{
          form: 'update-category-form',
        }}
      />
    ),
  },
]

export default function CategoriesTable({ categories }: { categories: Category[] }) {
  const columns = getColumns()
  return <DataTable data={categories} columns={columns} />
}

function EditAction({
  category,
  defaultValues,
}: {
  category: Category
  defaultValues: DefaultValues<Category>
}) {
  const handleSubmit = (formData: FormData) => {
    const name = formData.get('name') as string
    const ok = updateCategory({
      where: {
        id: category.id,
      },
      data: {
        name,
      },
    })

    toast.promise(ok, {
      loading: 'Загрузка...',
      success: 'Категория успешно обновлена',
      error: (e) => e.message,
    })
  }

  return (
    <form id="update-category-form" action={handleSubmit}>
      <Label htmlFor="name">Название категории</Label>
      <Input id="name" name="name" defaultValue={defaultValues.name} />
    </form>
  )
}
