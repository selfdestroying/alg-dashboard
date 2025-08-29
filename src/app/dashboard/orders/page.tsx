import { getOrders } from '@/actions/orders'
import OrdersTable from '@/components/tables/orders-table'

export default async function Page() {
  const orders = await getOrders()

  return <OrdersTable orders={orders} />
}
