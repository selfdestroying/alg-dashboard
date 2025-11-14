import DismissedTable from '@/components/tables/dismissed-table'
import prisma from '@/lib/prisma'

export default async function Page() {
  const dismissed = await prisma.dismissed.findMany({ include: { group: true, student: true } })

  return <DismissedTable dismissed={dismissed} />
}
