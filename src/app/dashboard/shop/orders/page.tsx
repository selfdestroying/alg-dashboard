import { getOrders } from '@/actions/orders'
import OrdersTable from '@/app/dashboard/shop/orders/_components/orders-table'

export default async function Page() {
  const orders = await getOrders()

  return <OrdersTable orders={orders} />
}
