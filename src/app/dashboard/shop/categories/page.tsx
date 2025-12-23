import { getCategories } from '@/actions/categories'
import FormDialog from '@/components/button-dialog'
import CategoryForm from '@/components/forms/category-form'
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
