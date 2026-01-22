import { getCategories } from '@/actions/categories'
import CategoriesTable from './_components/categories-table'

export default async function Page() {
  const categories = await getCategories()

  return (
    <div className="space-y-2">
      <div>
        <CategoriesTable categories={categories} />
      </div>
    </div>
  )
}
