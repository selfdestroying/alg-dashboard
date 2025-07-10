import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiGet } from '@/lib/api/api-server'
import { IGroup } from '@/types/group'
import { IStudent } from '@/types/student'
import { User, Users } from 'lucide-react'

export default async function Page() {
  const groups = await apiGet<IGroup[]>('groups')
  const students = await apiGet<IStudent[]>('students')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <p className="text-muted-foreground">Добро пожаловать в панель управления</p>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {groups.success && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Группы</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.data.length}</div>
              <p className="text-xs text-muted-foreground">Текущее количество запущенных групп</p>
            </CardContent>
          </Card>
        )}
        {students.success && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Ученики</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.data.length}</div>
              <p className="text-xs text-muted-foreground">Текущее количество учеников</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
