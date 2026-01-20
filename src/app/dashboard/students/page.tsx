import { getStudents } from '@/actions/students'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CreateStudentDialog from './_components/create-student-dialog'
import StudentsTable from './_components/students-table'

export default async function Page() {
  const students = await getStudents()

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Ученики</CardTitle>
          <CardDescription>Список всех учеников системы</CardDescription>
          <CardAction>
            <CreateStudentDialog />
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <StudentsTable data={students} />
        </CardContent>
      </Card>
    </div>
  )
}
