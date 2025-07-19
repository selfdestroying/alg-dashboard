import PaymentsTable from '@/components/tables/payments-table'
import PaymentDialog from '@/components/dialogs/payment-dialog'
import { getPayments } from '@/actions/payments'

export default async function Page() {
  const payments = await getPayments()

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <PaymentDialog />
      </div>
      <div>
        <PaymentsTable payments={payments} />
      </div>
    </>
  )
}
