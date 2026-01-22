import { getPayments, getUnprocessedPayments } from '@/actions/payments'
import PaymentsTable from '@/app/dashboard/finances/payments/_components/payments-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import UnprocessedPaymentTable from './_components/unprocessed-payment-table'

export default async function Page() {
  const payments = await getPayments({
    include: {
      student: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  const unprocessedPayments = await getUnprocessedPayments({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Оплаты</CardTitle>
          {/* <PaymentDialogForm students={students} /> */}
        </CardHeader>
        <CardContent>
          <PaymentsTable data={payments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Неразобранное</CardTitle>
        </CardHeader>
        <CardContent>
          <UnprocessedPaymentTable data={unprocessedPayments} />
        </CardContent>
      </Card>
    </div>
  )
}
