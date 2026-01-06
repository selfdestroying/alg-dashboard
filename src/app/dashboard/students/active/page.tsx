import { getActiveStudents } from '@/actions/students'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActiveStudentsTable } from './_components/active-students-table'

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
