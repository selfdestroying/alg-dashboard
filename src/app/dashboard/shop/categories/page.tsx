import { getCategories } from '@/actions/categories'
import CategoryForm from '@/app/dashboard/shop/categories/_components/category-form'
import FormDialog from '@/components/button-dialog'
import CategoriesTable from '@/components/tables/categories-table'

export default async function Page() {
  const categories = await getCategories()

  return (
    <div className="space-y-2">
      <FormDialog
        title="Добавить категорию"
        submitButtonProps={{ form: 'category-form' }}
        FormComponent={CategoryForm}
      />
      <div>
        <CategoriesTable categories={categories} />
      </div>
    </div>
  )
}
