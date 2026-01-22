import { getCategories } from '@/actions/categories'
import { getProducts } from '@/actions/products'
import ProductsTable from '@/app/dashboard/shop/products/_components/products-table'

export default async function Page() {
  const products = await getProducts()
  const categories = await getCategories()

  return (
    <>
      <div className="flex items-center gap-2"></div>
      <ProductsTable products={products} />
    </>
  )
}
