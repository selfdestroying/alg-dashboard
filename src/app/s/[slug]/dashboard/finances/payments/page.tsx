import PaymentsTable from '@/app/dashboard/finances/payments/_components/payments-table'
import { getPayments, getUnprocessedPayments } from '@/src/actions/payments'
import { getStudents } from '@/src/actions/students'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import AddPaymentButton from './_components/add-payment-button'
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
  const students = await getStudents({ orderBy: { id: 'asc' } })

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Оплаты</CardTitle>
          <CardAction>
            <AddPaymentButton students={students} />
          </CardAction>
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
          <UnprocessedPaymentTable data={unprocessedPayments} students={students} />
        </CardContent>
      </Card>
    </div>
  )
}
