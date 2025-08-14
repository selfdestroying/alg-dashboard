import { getCategories } from '@/actions/categories'
import FormDialog from '@/components/button-dialog'
import CategoryForm from '@/components/forms/category-form'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Page() {
  const categories = await getCategories()

  return (
    <div className="space-y-2">
      <FormDialog
        title="Добавить категорию"
        submitButtonProps={{ form: 'category-form' }}
        FormComponent={CategoryForm}
      />

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
