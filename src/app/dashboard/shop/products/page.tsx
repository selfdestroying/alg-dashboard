import { getCategories } from '@/actions/categories'
import { getProducts } from '@/actions/products'
import ProductsTable from '@/app/dashboard/shop/products/_components/products-table'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AddProductButton from './_components/add-product-button'

export default async function Page() {
  const products = await getProducts({
    include: { category: true },
    orderBy: { id: 'asc' },
  })
  const categories = await getCategories()

  return (
    <>
      <div className="grid min-h-0 flex-1 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Товары</CardTitle>
            <CardDescription>Список всех товаров системы</CardDescription>
            <CardAction>
              <AddProductButton categories={categories} />
            </CardAction>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ProductsTable data={products} categories={categories} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
