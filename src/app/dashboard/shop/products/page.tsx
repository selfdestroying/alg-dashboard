import { getCategories } from '@/actions/categories'
import { getProducts } from '@/actions/products'
import ProductsTable from '@/app/dashboard/shop/products/_components/products-table'
import FormDialog from '@/components/button-dialog'
import ProductForm from '@/components/forms/product-form'

export default async function Page() {
  const products = await getProducts()
  const categories = await getCategories()

  return (
    <>
      <div className="flex items-center gap-2">
        <FormDialog
          title="Добавить товар"
          submitButtonProps={{ form: 'product-form' }}
          FormComponent={ProductForm}
          formComponentProps={{ categories }}
        />
      </div>
      <ProductsTable products={products} />
    </>
  )
}
