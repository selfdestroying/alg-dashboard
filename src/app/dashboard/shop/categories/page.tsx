import { getCategories } from '@/actions/categories'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AddCategoryButton from './_components/add-category-button'
import CategoriesTable from './_components/categories-table'

export default async function Page() {
  const categories = await getCategories()

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Категории</CardTitle>
          <CardDescription>Список всех категорий системы</CardDescription>
          <CardAction>
            <AddCategoryButton />
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <CategoriesTable data={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
