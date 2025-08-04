import { getGroups } from '@/actions/groups'
import { getPayments } from '@/actions/payments'
import { getStudents } from '@/actions/students'
import ButtonDialog from '@/components/button-dialog'
import PaymentForm from '@/components/forms/payment-form'
import PaymentsTable from '@/components/tables/payments-table'

export default async function Page() {
  const payments = await getPayments()
  const students = await getStudents()
  const groups = await getGroups()

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <ButtonDialog title="Добавить оплату" submitButtonProps={{ form: 'payment-form' }}>
          <PaymentForm students={students} groups={groups} />
        </ButtonDialog>
      </div>
      <div>
        <PaymentsTable payments={payments} />
      </div>
    </>
  )
}
