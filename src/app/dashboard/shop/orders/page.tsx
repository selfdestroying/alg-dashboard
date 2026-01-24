import { getOrders } from '@/actions/orders'
import OrdersTable from '@/app/dashboard/shop/orders/_components/orders-table'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function Page() {
  const orders = await getOrders({
    include: { product: true, student: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Заказы</CardTitle>
          <CardDescription>Список всех заказов системы</CardDescription>
          <CardAction></CardAction>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <OrdersTable data={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
