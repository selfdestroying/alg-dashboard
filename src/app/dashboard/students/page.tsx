import { IStudent } from '@/types/student'
import { api } from '@/lib/api/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'
import StudentDialog from '@/components/student/student-dialog'
import { getUser } from '@/lib/dal'
import StudentTable from '@/components/student/student-table'

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
              Ученики
            </CardTitle>
          </div>
          {user && students.success && <StudentDialog />}
        </div>
      </CardHeader>
      <CardContent>
        {students.success ? (
          <StudentTable data={students.data} isAuthenticated={Boolean(user)} inGroup={false} />
        ) : (
          <div>Error</div>
        )}
      </CardContent>
    </Card>
  )
}
