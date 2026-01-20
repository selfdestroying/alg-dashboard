import { getActiveStudents, getActiveStudentStatistics } from '@/actions/students'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ActiveStudentsTable from './_components/active-students-table'
import ActiveStatistics from './statistics/active-statistics'

export default async function Page() {
  const students = await getActiveStudents()
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
