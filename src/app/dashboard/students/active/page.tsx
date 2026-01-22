import { getActiveStudentStatistics } from '@/actions/students'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import ActiveStudentsTable from './_components/active-students-table'
import ActiveStatistics from './statistics/active-statistics'

export default async function Page() {
  const students = await prisma.studentGroup.findMany({
    include: {
      group: {
        include: {
          location: true,
          course: true,
          teachers: {
            include: {
              teacher: true,
            },
          },
        },
      },
      student: {
        include: {
          payments: true,
        },
      },
    },
  })
  const statistics = await getActiveStudentStatistics()

  return (
    <div className="grid grid-cols-1 gap-2">
      <ActiveStatistics {...statistics} />
      <Card>
        <CardHeader>
          <CardTitle>Активные ученики</CardTitle>
          <CardDescription>Список всех активных учеников системы</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ActiveStudentsTable data={students} />
        </CardContent>
      </Card>
    </div>
  )
}
