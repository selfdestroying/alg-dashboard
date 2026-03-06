import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import AddPaymentButton from '@/src/features/finances/payments/components/add-payment-button'
import PaymentsTable from '@/src/features/finances/payments/components/payments-table'
import UnprocessedPaymentTable from '@/src/features/finances/payments/components/unprocessed-payment-table'

export const metadata = { title: 'Оплаты' }

export default function Page() {
  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Оплаты</CardTitle>
          <CardAction>
            <AddPaymentButton />
          </CardAction>
        </CardHeader>
        <CardContent>
          <PaymentsTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Неразобранное</CardTitle>
        </CardHeader>
        <CardContent>
          <UnprocessedPaymentTable />
        </CardContent>
      </Card>
    </div>
  )
}
