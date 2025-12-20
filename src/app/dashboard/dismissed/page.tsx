import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import DismissedTable from './dismissed-table'

export default async function Page() {
  const dismissed = await prisma.dismissed.findMany({
    include: {
      group: {
        include: { course: true },
      },
      student: true,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отток</CardTitle>
      </CardHeader>
      <CardContent>
        <DismissedTable dismissed={dismissed} />
      </CardContent>
    </Card>
  )
}
