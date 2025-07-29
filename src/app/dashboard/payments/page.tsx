import { getPayments } from '@/actions/payments'
import PaymentDialog from '@/components/dialogs/payment-dialog'
import PaymentsTable from '@/components/tables/payments-table'

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
