import { getPayments, getUnprocessedPayments } from '@/actions/payments'
import { getStudents } from '@/actions/students'
import PaymentProductsTable from '@/components/tables/payment-product-table'
import PaymentsTable from '@/components/tables/payments-table'
import UnprocessedPaymentTable from '@/components/tables/unprocessed-payment-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const payments = await getPayments({ orderBy: { createdAt: 'desc' } })
  const unprocessedPayments = await getUnprocessedPayments()
  const students = await getStudents({})
  const payementProducts = await prisma.paymentProduct.findMany()

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Оплаты</CardTitle>
          {/* <PaymentDialogForm students={students} /> */}
        </CardHeader>
        <CardContent>
          <PaymentsTable payments={payments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Неразобранное</CardTitle>
        </CardHeader>
        <CardContent>
          <UnprocessedPaymentTable unprocessedPayments={unprocessedPayments} students={students} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Товары для оплат</CardTitle>
          {/* <FormDialog
            title="Добавить товар оплаты"
            icon="plus"
            FormComponent={PaymentProductForm}
            triggerButtonProps={{
              size: 'sm',
              variant: 'outline',
            }}
            submitButtonProps={{
              form: 'payment-product-form',
            }}
          /> */}
        </CardHeader>
        <CardContent>
          <PaymentProductsTable paymentProducts={payementProducts} />
        </CardContent>
      </Card>
    </div>
  )
}
