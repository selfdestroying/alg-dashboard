import { columns } from '@/app/dashboard/students/students'
import DataTable from '@/components/ui/data-table'
import { IStudent } from '@/types/student'
import { api } from '@/lib/api/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'
import StudentDialog from '@/components/student/student-dialog'
import { getUser } from '@/lib/dal'

export default async function Page() {
  const user = await getUser()
  const students = await api.get<IStudent[]>('students')

  return (
    <Card className="flex-1/2 gap-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students
            </CardTitle>
          </div>
          {user && students.success && <StudentDialog />}
        </div>
      </CardHeader>
      <CardContent>
        {students.success ? (
          <DataTable columns={columns} data={students.data} pageSize={0} />
        ) : (
          <div>Error</div>
        )}
      </CardContent>
    </Card>
  )
}
