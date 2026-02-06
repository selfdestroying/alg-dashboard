import { getDismissedStatistics } from '@/src/actions/dismissed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import prisma from '@/src/lib/prisma'
import DismissedStudentsTable from './_components/dismissed-table'
import DismissedStatistics from './statistics/dismissed-statistics'

export default async function Page() {
  const dismissed = await prisma.dismissed.findMany({
    include: {
      group: {
        include: { course: true, location: true, teachers: { include: { teacher: true } } },
      },
      student: true,
    },
    orderBy: { date: 'desc' },
  })

  const statistics = await getDismissedStatistics()

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-2">
      <DismissedStatistics {...statistics} />
      <Card>
        <CardHeader>
          <CardTitle>Ученики</CardTitle>
          <CardDescription>Список всех учеников системы</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <DismissedStudentsTable data={dismissed} />
        </CardContent>
      </Card>
    </div>
  )
}
