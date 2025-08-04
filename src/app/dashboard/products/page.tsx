import { getCategories } from '@/actions/categories'
import { getProducts } from '@/actions/products'
import ButtonDialog from '@/components/button-dialog'
import ProductForm from '@/components/forms/product-form'
import ProductsTable from '@/components/tables/products-table'

export default async function Page() {
  const products = await getProducts()
  const categories = await getCategories()

  return (
    <>
      <div className="flex items-center gap-2">
        <ButtonDialog title="Добавить товар" submitButtonProps={{ form: 'product-form' }}>
          <ProductForm categories={categories} />
        </ButtonDialog>
      </div>
      <ProductsTable products={products} />
    </>
  )
}
