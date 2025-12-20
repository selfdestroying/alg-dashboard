import { getDismissedStatistics } from '@/actions/dismissed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import DismissedStatistics from './dismissed-statistics'
import DismissedTable from './dismissed-table'

export default async function Page() {
  const dismissed = await prisma.dismissed.findMany({
    include: {
      group: {
        include: { course: true, teachers: { include: { teacher: true } } },
      },
      student: true,
    },
  })

  const statistics = await getDismissedStatistics()

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle>Отток</CardTitle>
        </CardHeader>
        <CardContent>
          <DismissedTable dismissed={dismissed} />
        </CardContent>
      </Card>
      <DismissedStatistics {...statistics} />
    </div>
  )
}
