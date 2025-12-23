import { getActiveStudents } from '@/actions/students'
import { ActiveStudentsTable } from '@/components/tables/active-students-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Page() {
  const students = await getActiveStudents()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Активные ученики</CardTitle>
      </CardHeader>
      <CardContent>
        <ActiveStudentsTable data={students} />
      </CardContent>
    </Card>
  )
}
