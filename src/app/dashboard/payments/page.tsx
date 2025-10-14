import { getPayments, getUnprocessedPayments } from '@/actions/payments'
import { getStudents } from '@/actions/students'
import PaymentDialogForm from '@/components/forms/payment-form'
import PaymentsTable from '@/components/tables/payments-table'
import UnprocessedPaymentTable from '@/components/tables/unprocessed-payment-table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default async function Page() {
  const payments = await getPayments()
  const unprocessedPayments = await getUnprocessedPayments()
  const students = await getStudents({})

  return (
    <div className="space-y-6">
      <PaymentDialogForm students={students} />
      <Card>
        <CardHeader>Оплаты</CardHeader>
        <CardContent>
          <PaymentsTable payments={payments} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>Неразобранное</CardHeader>
        <CardContent>
          <UnprocessedPaymentTable unprocessedPayments={unprocessedPayments} students={students} />
        </CardContent>
      </Card>
    </div>
  )
}
